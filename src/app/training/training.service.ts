import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { take } from 'rxjs/Operators';

import { Exercise } from './exercise.model';
import { UIService } from '../shared/ui.service';
import * as fromTraining from './training.reducer';
import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';

@Injectable()
export class TrainingService {

  private fbSubs: Subscription[] = [];

  constructor(private afs: AngularFirestore,
              private uiService: UIService,
              private store: Store<fromTraining.State>
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
      this.store.dispatch(new Training.SetAvailableTrainings(exercises));
    }, error => {
      // this.uiService.loadingStateChaged.next(false);
      this.store.dispatch(new UI.StopLoading());
      this.uiService.showSnackBar('Fetching exercises failed, please try again later.', null, 3000);
    }));
  }

  startExercise(selectedId: string) {
    this.store.dispatch(new Training.StarTraining(selectedId));
  }

  completeExercise() {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
      this.addDataToDatabase({
        ...ex,
        date: new Date(),
        state: 'completed'
      });
      this.store.dispatch(new Training.StopTraining());
    });
  }

  cancelExercise(progress: number) {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
      this.addDataToDatabase({
        ...ex,
        duration: ex.duration * (progress / 100),
        calories: ex.calories * (progress / 100),
        date: new Date(),
        state: 'cancelled'
      });
      this.store.dispatch(new Training.StopTraining());
    });
  }

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(this.afs.collection('finishedExercises')
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.store.dispatch(new Training.SetFinishedTrainings(exercises));
    }));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }
  private addDataToDatabase(exercise: Exercise) {
    this.afs.collection('finishedExercises').add(exercise);
  }
}
