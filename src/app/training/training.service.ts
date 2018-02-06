import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Store } from '@ngrx/store';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { Exercise } from './exercise.model';
import { UIService } from '../shared/ui.service';
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];

  constructor(private afs: AngularFirestore,
              private uiService: UIService,
              private store: Store<fromRoot.State>
            ) {}

  fetchAvailableExercises() {
    // this.uiService.loadingStateChaged.next(true);
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(this.afs.collection('availableExercises').snapshotChanges()
    .map(docArray => {
      return docArray.map(doc => {
        return {
          id: doc.payload.doc.id,
          ...doc.payload.doc.data()
        };
      });
    })
    .subscribe((exercises: Exercise[]) => {
      // this.uiService.loadingStateChaged.next(false);
      this.store.dispatch(new UI.StopLoading());
      this.availableExercises = exercises;
      this.exercisesChanged.next([...this.availableExercises]);
    }, error => {
      // this.uiService.loadingStateChaged.next(false);
      this.store.dispatch(new UI.StopLoading());
      this.uiService.showSnackBar('Fetching exercises failed, please try again later.', null, 3000);
      this.exerciseChanged.next(null);
    }));
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.exerciseChanged.next({...this.runningExercise});
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);

  }

  getRunningExercise() {
    return {...this.runningExercise};
  }

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(this.afs.collection('finishedExercises')
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
      this.finishedExercisesChanged.next(exercises);
    }));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }
  private addDataToDatabase(exercise: Exercise) {
    this.afs.collection('finishedExercises').add(exercise);
  }
}
