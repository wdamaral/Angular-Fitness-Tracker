import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';

//rxjs
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { map } from 'rxjs/Operators';

import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { UIService } from '../../shared/ui.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit {

  exercises: Exercise[];
  exerciseSubscription: Subscription;
  private loadingSubscription: Subscription;
  isLoading = true;

  constructor(private trainingService: TrainingService, private uiService: UIService) { }

  ngOnInit() {
    this.loadingSubscription = this.uiService.loadingStateChaged.subscribe(
      isLoading => {
        this.isLoading = isLoading;
    });

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

  ngOnDestroy() {
    this.loadingSubscription.unsubscribe();
    this.exerciseSubscription.unsubscribe();
  }
}
