import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TsCheckboxComponent } from '@terminus/ui/checkbox';
import { TsInputComponent } from '@terminus/ui/input';
import { TsValidatorsService } from '@terminus/ui/validators';


/**
 * Define the structure of the login form response
 */
export interface TsLoginFormResponse {
  /**
   * User's email
   */
  email: string;

  /**
   * User's password
   */
  password: string;

  /**
   * Flag determining if a cookie should be set
   */
  rememberMe: boolean;
}


/**
 * This is the login-form UI Component
 *
 * @example
 * <ts-login-form
 *              [inProgress]="true"
 *              [forgotPasswordLink]="['my/', 'path']"
 *              [triggerFormReset]="myBoolean"
 *              [loginCTA]=" 'Sign In' "
 *              [forgotPasswordText]=" 'Forget something?' "
 *              (submission)="myMethod($event)"
 * ></ts-login-form>
 *
 * <example-url>https://getterminus.github.io/ui-demos-release/components/login-form</example-url>
 */
@Component({
  selector: 'ts-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  host: { class: 'ts-login-form' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'tsLoginForm',
})
export class TsLoginFormComponent implements OnChanges {
  /**
   * Define the form group for re-use
   */
  private FORM_GROUP = {
    email: [
      null,
      [
        Validators.required,
        this.validatorsService.email(),
      ],
    ],
    password: [
      null,
      [
        Validators.required,
      ],
    ],
    rememberMe: [
      false,
    ],
  };

  /**
   * Initialize the login form
   */
  public loginForm: FormGroup = this.formBuilder.group(this.FORM_GROUP);

  /**
   * Define a flag to add/remove the form from the DOM
   */
  public showForm = true;

  /**
   * Access the email form control
   */
  public get emailControl(): AbstractControl | null {
    return this.loginForm.get('email');
  }

  /**
   * Access the password form control
   */
  public get passwordControl(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  /**
   * Access the rememberMe form control
   */
  public get rememberMeControl(): AbstractControl | null {
    return this.loginForm.get('rememberMe');
  }

  /**
   * Provide access to the text inputs
   */
  @ViewChildren(TsInputComponent)
  public inputComponents!: QueryList<TsInputComponent>;

  /**
   * Provide access to the checkbox inputs
   */
  @ViewChild(TsCheckboxComponent, { static: true })
  public checkbox!: TsCheckboxComponent;

  /**
   * Define the link to the 'forgot password' view
   */
  @Input()
  public forgotPasswordLink: string[] = ['/forgot'];

  /**
   * Define the text for the 'forgot password' link
   */
  @Input()
  public forgotPasswordText = 'Forgot your password?';

  /**
   * Define if the form button is showing progress
   */
  @Input()
  public inProgress = false;

  /**
   * Define if the user has successfully logged in and is being redirected
   */
  @Input()
  public isRedirecting = false;

  /**
   * Define the login call to action
   */
  @Input()
  public loginCTA = 'Log In';

  /**
   * Allow a consumer to reset the form via an input
   */
  @Input()
  public triggerFormReset = false;

  /**
   * Emit an event on form submission
   */
  @Output()
  public readonly submission: EventEmitter<TsLoginFormResponse> = new EventEmitter();


  constructor(
    private formBuilder: FormBuilder,
    private validatorsService: TsValidatorsService,
  ) {}

  /**
   * Trigger a form reset if `triggerFormReset` is changed to TRUE
   * (explanation at `resetForm` method)
   *
   * @param changes - The inputs that have changed
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('triggerFormReset')) {
      this.resetForm();
    }
  }

  /**
   * Reset the form
   */
  public resetForm(): void {
    this.loginForm.reset();
  }
}
