import { Component } from '@angular/core';
import {
  NgModel,
  FormGroup,
  AbstractControl,
  FormBuilder,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'demo-input',
  template: `
    <form [formGroup]="myForm" novalidate>
      <ts-input
        formControlName="email"
        [formControl]="getControl('email')"
        [label]="label1"
        [canClear]="clearable"
        hint="A valid email is required."
        [isRequired]="true"
      ></ts-input>
      <button (click)="submit(myForm)">Submit</button>
    </form>
  `,
})
export class InputComponent {
  label1 = 'My Input';
  label2 = 'My 2nd Input';
  clearable = true;
  icon = 'home';
  model1 = 'A seeded value';

  myForm = this.formBuilder.group({
    email: [
      null,
      [
        Validators.required,
      ],
    ],
  });


  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  submit(v: any) {
    console.log('Submit!: ', v);
  }

  getControl(name: string): AbstractControl {
    return this.myForm.controls[name];
  }
}
