import { Component } from '@angular/core';

@Component({
  selector: 'demo-datepicker',
  template: `
    <ts-datepicker
      [dateFilter]="myFilter"
      [startingView]="startView"
      [initialDate]="myDate"
      [isDisabled]="isDisabled"
      (selected)="dateSelected($event)"
    ></ts-datepicker>
  `,
})
export class DatepickerComponent {
  isDisabled = false;
  startView = 'month';

  myDate = new Date(2017, 4, 1);

  myFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  }

  dateSelected(e: any) {
    console.log('Date selected!: ', e);
  }
}