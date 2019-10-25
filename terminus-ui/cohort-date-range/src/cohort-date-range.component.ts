import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';

/**
 * Represents date cohort object that passed in
 */
export interface TsDateCohort {
  display: string;
  range: {
    startDate: string | Date;
    endDate: string | Date;
  };
}

/**
 * Cohort date range change event interface
 */
export interface TsCohortDateChangeEvent{
  start: string | Date;
  end: string | Date;
}

/**
 * Event object emitted by {@link TsCohortDateRangeComponent} when there is date range change
 */
export class TsCohortDateRangeChanged {
  constructor(
    public start: string | Date,
    public end: string | Date,
    public source: TsCohortDateRangeComponent,
  ) { }
}

/**
 * This is the cohort-date-range UI Component
 *
 *
 * @example
 * <ts-cohort-date-range
 *              [allowCustomDates]="true"
 *              [cohorts]="myCohorts"
 *              (cohortDateRangeChange)="myFunc($event)"
 * ></ts-cohort-date-range>
 *
 * <example-url>https://getterminus.github.io/ui-demos-release/components/cohort-date-range</example-url>
 */
@Component({
  selector: 'ts-cohort-date-range',
  templateUrl: './cohort-date-range.component.html',
  styleUrls: ['./cohort-date-range.component.scss'],
  host: {
    'class': 'ts-cohort-date-range',
    '[class.ts-cohort-date-range--disabled]': 'isDisabled',
    '[attr.disabled]': 'isDisabled',
    '[attr.aria-disabled]': 'isDisabled',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'tsCohortDateRange',
})
export class TsCohortDateRangeComponent {
  /**
   * Define whether date range is disabled
   */
  public disableDateRange = false;

  /**
   * Initialize the date range with empty start and end date
   */
  public formGroup = this.formBuilder.group({
    dateRange: this.formBuilder.group({
      startDate: [null],
      endDate: [null],
    }),
  });

  /**
   * Get reference of dateRange from formGroup
   */
  public dateRangeFg = this.formGroup.get('dateRange');

  /**
   * Define whether custom date is allowed
   */
  @Input()
  public allowCustomDates = true;

  /**
   * Cohort dates
   */
  @Input()
  public cohorts!: ReadonlyArray<TsDateCohort>;

  /**
   * Disable the component
   */
  @Input()
  public isDisabled = false;

  /**
   * Cohort change event emitter
   */
  @Output()
  public readonly cohortDateRangeChanged: EventEmitter<TsCohortDateRangeChanged> = new EventEmitter();


  constructor(
    public formBuilder: FormBuilder,
  ) { }

  /**
   * Called when cohort date range changed and emit cohortDaterangeChanged event
   *
   * @param event - triggered by date range change
   */
  public cohortDateRangeChange(event: TsCohortDateChangeEvent): void {
    this.cohortDateRangeChanged.emit(new TsCohortDateRangeChanged(event.start, event.end, this));
  }

  /**
   * Called when selection changed
   *
   * @param event - TsSelectChangeEvent
   */
  public selectionChange(event): void {
    const startCtrl = this.formGroup.get('dateRange.startDate');
    const endCtrl = this.formGroup.get('dateRange.endDate');
    // istanbul ignore else
    if (startCtrl && endCtrl) {
      const startValue = event.value.start;
      const endValue = event.value.end;
      if (startValue && endValue) {
        startCtrl.setValue(startValue);
        endCtrl.setValue(endValue);
        // Make date range readonly when selection provides start and end date.
        this.disableDateRange = true;
        this.cohortDateRangeChange(event.value);
      } else {
        this.disableDateRange = false;
      }
    }
  }

  /**
   * Function for tracking for-loops changes
   *
   * @param index - The item index
   * @return The index
   */
  public trackByFn(index): number {
    return index;
  }
}