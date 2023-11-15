import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { selectFocusSessionDuration } from '../store/focus-mode.selectors';
import {
  setFocusSessionActivePage,
  setFocusSessionDuration,
  startFocusSession,
} from '../store/focus-mode.actions';
import { FocusModePage } from '../focus-mode.const';
import { selectCurrentTask } from '../../tasks/store/task.selectors';
import { Observable, Subject } from 'rxjs';
import { FocusModeConfig } from '../../config/global-config.model';
import { selectFocusModeConfig } from '../../config/store/global-config.reducer';
import { takeUntil } from 'rxjs/operators';
import { T } from 'src/app/t.const';

@Component({
  selector: 'focus-mode-duration-selection',
  templateUrl: './focus-mode-duration-selection.component.html',
  styleUrls: ['./focus-mode-duration-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusModeDurationSelectionComponent implements AfterViewInit, OnDestroy {
  T: typeof T = T;
  sessionDuration$ = this._store.select(selectFocusSessionDuration);
  task$ = this._store.select(selectCurrentTask);
  updatedFocusModeDuration?: number;
  focusTimeout = 0;
  cfg$: Observable<FocusModeConfig> = this._store.select(selectFocusModeConfig);
  cfg?: FocusModeConfig;
  private _onDestroy$ = new Subject<void>();

  constructor(private readonly _store: Store) {
    this.cfg$.pipe(takeUntil(this._onDestroy$)).subscribe((v) => (this.cfg = v));
  }

  ngAfterViewInit(): void {
    this.focusTimeout = window.setTimeout(() => {
      const el = document.querySelector('input');
      (el as HTMLElement).focus();
      (el as any).select();
    }, 200);
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.focusTimeout);
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  onFocusModeDurationChanged(duration: number): void {
    this.updatedFocusModeDuration = duration;
  }

  onSubmit($event: SubmitEvent): void {
    $event.preventDefault();
    if (this.updatedFocusModeDuration) {
      this._store.dispatch(
        setFocusSessionDuration({ focusSessionDuration: this.updatedFocusModeDuration }),
      );
    }
    if (this.cfg?.isSkipPreparation) {
      this._store.dispatch(startFocusSession());
      this._store.dispatch(
        setFocusSessionActivePage({ focusActivePage: FocusModePage.Main }),
      );
    } else {
      this._store.dispatch(
        setFocusSessionActivePage({ focusActivePage: FocusModePage.Preparation }),
      );
    }
  }

  selectDifferentTask(): void {
    this._store.dispatch(
      setFocusSessionActivePage({ focusActivePage: FocusModePage.TaskSelection }),
    );
  }
}
