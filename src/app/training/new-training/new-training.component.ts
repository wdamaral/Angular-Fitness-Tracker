import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';

// rxjs
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { map } from 'rxjs/Operators';

import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { UIService } from '../../shared/ui.service';
import * as fromRoot from '../../app.reducer';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit {

  exercises: Exercise[];
  exerciseSubscription: Subscription;
  // private loadingSubscription: Subscription;
  isLoading$: Observable<boolean>;

  constructor(private trainingService: TrainingService, private uiService: UIService,
              private store: Store<fromRoot.State>) { }

  ngOnInit() {
    // this.loadingSubscription = this.uiService.loadingStateChaged.subscribe(
    //   isLoading => {
    //     this.isLoading = isLoading;
    // });
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);

    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(
      exercises => (this.exercises = exercises)
    );
    this.fetchExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // this.loadingSubscription.unsubscribe();
    this.exerciseSubscription.unsubscribe();
  }
}
