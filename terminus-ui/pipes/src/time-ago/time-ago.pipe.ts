import {
  isDevMode,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  formatDistance,
  isValid,
} from 'date-fns';


@Pipe({
  name: 'tsTimeAgo',
})
export class TsTimeAgoPipe implements PipeTransform {
  transform(value: string | Date, comparedDate: string | Date): string | undefined {
    // Check for null values to avoid issues during data-binding
    if (value == null || value === '') {
      return;
    }

    // Check for date validity
    if (!isValid(value) && isDevMode()) {
      throw Error(`'${value}' is not a valid date.`);
    }
    if (!isValid(comparedDate) && isDevMode()) {
      throw Error(`'${comparedDate}' is not a valid date.`);
    }

    // If dealing with a date objects, convert to strings
    const date1: Date = (typeof value === 'string') ? new Date(value) : value;
    const date2: Date = (typeof comparedDate === 'string') ? new Date(comparedDate) : comparedDate;

    return formatDistance(date1, date2);
  }
}
