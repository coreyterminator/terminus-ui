import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  Component,
  OnInit,
  Provider,
  Type,
  ViewChild,
} from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { TsDocumentServiceMock, createFakeEvent } from '@terminus/ngx-tools/testing';
import { TsDocumentService } from '@terminus/ngx-tools';
import { TsInputComponent, TsInputModule } from '@terminus/ui/input';

import { TsFormFieldModule, TsFormFieldComponent } from './form-field.module';


// tslint:disable: no-use-before-declare


/**
 * NOTE: TsInputComponent tests cover much of the TsFormFieldComponent functionality
 */
describe(`TsFormFieldComponent`, function() {

  describe(`id`, () => {

    test(`should allow custom IDs for accessibility`, () => {
      const fixture = createComponent(Id);
      fixture.detectChanges();
      const labelElement = fixture.debugElement.query(By.css('.ts-form-field__label'));

      expect(labelElement.nativeElement.getAttribute('aria-owns')).toEqual('foo');
    });


    test(`should fall back to UID if no ID is passed in`, () => {
      const fixture = createComponent(Id);
      fixture.componentInstance.myId = undefined;
      fixture.detectChanges();
      const labelElement = fixture.debugElement.query(By.css('.ts-form-field__label'));

      expect(labelElement.nativeElement.getAttribute('aria-owns')).toEqual(expect.stringContaining('ts-form-field-'));
    });

  });


  test(`should allow required marker to be hidden`, () => {
    const fixture = createComponent(RequiredMarker);
    fixture.detectChanges();
    let requiredElement = fixture.debugElement.query(By.css('.ts-form-field-required-marker'));

    expect(requiredElement).toBeTruthy();

    fixture.componentInstance.hideRequiredMarker = true;
    fixture.detectChanges();

    requiredElement = fixture.debugElement.query(By.css('.ts-form-field-required-marker'));
    expect(requiredElement).toBeFalsy();
  });


  describe(`floatLabel`, () => {

    test(`should fallback to 'auto' if no value is passed in`, () => {
      const fixture = createComponent(Float);
      fixture.detectChanges();

      expect(fixture.componentInstance.formField.floatLabel).toEqual('auto');
    });

  });


  describe(`after content checked/init`, () => {

    test(`should throw an error if no control exists`, () => {
      const create = () => {
        const fixture = createComponent(NoControl);
        fixture.detectChanges();
      };

      expect(create).toThrowError();
    });

    test(`should retrigger outline update if the flag is set`, () => {
      const fixture = createComponent(UpdateOutline);
      fixture.detectChanges();
      const formField = fixture.componentInstance.formField;

      formField['updateOutlineGap'] = jest.fn();
      formField.outlineGapCalculationNeeded = true;
      formField.ngAfterContentChecked();

      expect(formField['updateOutlineGap']).toHaveBeenCalled();
    });

  });


  describe(`updateOutlineGap`, () => {

    test(`should do nothing if no label element exists`, () => {
      const fixture = createComponent(UpdateOutline);
      fixture.detectChanges();
      const formField = fixture.componentInstance.formField;

      formField.labelElement = undefined;

      expect(formField['updateOutlineGap']()).toEqual(undefined);
    });


    test(`should set the flag if the label element is not in the DOM`, () => {
      const documentProvider = [
        {
          provide: TsDocumentService,
          useClass: MyDocumentService,
        },
      ];
      const fixture = createComponent(UpdateOutline, [documentProvider]);
      fixture.detectChanges();
      const formField = fixture.componentInstance.formField;

      expect(formField['updateOutlineGap']()).toEqual(undefined);
      expect(formField.outlineGapCalculationNeeded).toEqual(true);
    });

  });


  describe(`controlIsInErrorState`, () => {

    test(`should return error if dirty and validating on change`, () => {
      const fixture = createComponent(ErrorState);
      fixture.detectChanges();

      expect(fixture.componentInstance.formField.controlIsInErrorState).toEqual(true);
    });

  });


  describe(`getConnectedOverlayOrigin`, () => {

    test(`should fall back to elementRef if container is not found`, () => {
      const fixture = createComponent(Float);
      fixture.detectChanges();
      const formField = fixture.componentInstance.formField;
      formField.containerElement = undefined;

      expect(formField.getConnectedOverlayOrigin()).toEqual(formField.elementRef);
    });

  });


  test('should be able to animate the label up and lock it in position', () => {
    const fixture = createComponent(Id);
    fixture.detectChanges();
    const formField = fixture.componentInstance.formField;
    const label = fixture.debugElement.query(By.css('.ts-form-field__label')).nativeElement;

    expect(formField.floatLabel).toBe('auto');

    formField.animateAndLockLabel();
    fixture.detectChanges();

    expect(formField.shouldAlwaysFloat).toBe(false);
    expect(formField.floatLabel).toBe('always');

    const fakeEvent = (Object as any).assign(createFakeEvent('transitionend'), {propertyName: 'transform'});

    label.dispatchEvent(fakeEvent);
    fixture.detectChanges();

    expect(formField.shouldAlwaysFloat).toBe(true);
    expect(formField.floatLabel).toBe('always');
  });

});




// tslint:disable: component-class-suffix

@Component({
  template: `
    <ts-form-field [control]="inputComponent" [id]="myId">
      <ts-input
        [hasExternalFormField]="true"
        [formControl]="formControl"
      ></ts-input>
    </ts-form-field>
  `,
})
export class Id {
  formControl = new FormControl();
  myId: string | undefined = 'foo';

  @ViewChild(TsInputComponent)
  inputComponent: TsInputComponent;

  @ViewChild(TsFormFieldComponent)
  formField: TsFormFieldComponent;
}

@Component({
  template: `
    <ts-form-field
      [control]="inputComponent"
      [hideRequiredMarker]="hideRequiredMarker"
    >
      <ts-input
        [hasExternalFormField]="true"
        [formControl]="formControl"
      ></ts-input>
    </ts-form-field>
  `,
})
export class RequiredMarker {
  formControl = new FormControl(null, Validators.required);
  hideRequiredMarker = false;

  @ViewChild(TsInputComponent)
  inputComponent: TsInputComponent;
}

@Component({
  template: `
    <ts-form-field
      [control]="inputComponent"
      [floatLabel]="float"
    >
      <ts-input
        [hasExternalFormField]="true"
        [formControl]="formControl"
      ></ts-input>
    </ts-form-field>
  `,
})
export class Float {
  formControl = new FormControl();
  float;

  @ViewChild(TsInputComponent)
  inputComponent: TsInputComponent;

  @ViewChild(TsFormFieldComponent)
  formField: TsFormFieldComponent;
}

@Component({
  template: `
    <ts-form-field></ts-form-field>
  `,
})
export class NoControl {
}

@Component({
  template: `
    <ts-form-field
      [control]="inputComponent"
      [validateOnChange]="true"
    >
      <ts-input
        [hasExternalFormField]="true"
        [formControl]="formControl"
      ></ts-input>
    </ts-form-field>
  `,
})
export class ErrorState implements OnInit {
  formControl = new FormControl(null, Validators.required);

  @ViewChild(TsInputComponent)
  inputComponent: TsInputComponent;

  @ViewChild(TsFormFieldComponent)
  formField: TsFormFieldComponent;

  ngOnInit() {
    this.formControl.markAsDirty();
  }
}

@Component({
  template: `
    <ts-form-field
      [control]="inputComponent"
    >
      <ts-input
        [hasExternalFormField]="true"
        [formControl]="formControl"
      ></ts-input>
    </ts-form-field>
  `,
})
export class UpdateOutline {
  formControl = new FormControl();

  @ViewChild(TsInputComponent)
  inputComponent: TsInputComponent;

  @ViewChild(TsFormFieldComponent)
  formField: TsFormFieldComponent;
}



function createComponent<T>(component: Type<T>, providers: Provider[] = [], imports: any[] = []): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [
      FormsModule,
      ReactiveFormsModule,
      TsFormFieldModule,
      TsInputModule,
      NoopAnimationsModule,
      ...imports,
    ],
    declarations: [component],
    providers: [
      ...providers,
    ],
  }).compileComponents();

  return TestBed.createComponent<T>(component);
}

class MyDocumentService extends TsDocumentServiceMock {
  shouldContain = true;
  document: any = {
    documentElement: {
      contains: jest.fn(() => false),
    },
    createEvent() {
      return document.createEvent('Event');
    },
  };
}