import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class UIService {
  loadingStateChaged = new Subject<boolean>();

  constructor(private snackBar: MatSnackBar) {}
  showSnackBar(message, action, duration) {
    this.snackBar.open(message, action, {
      duration: duration
    });
  }
}
