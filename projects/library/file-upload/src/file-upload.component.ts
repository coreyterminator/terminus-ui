import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  isDevMode,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormControl,
  ValidationErrors,
} from '@angular/forms';
import { TsDocumentService } from '@terminus/ngx-tools/browser';
import {
  coerceArray,
  coerceNumberProperty,
} from '@terminus/ngx-tools/coercion';
import { KEYS } from '@terminus/ngx-tools/keycodes';
import {
  isDragEvent,
  isHTMLInputElement,
  isNumber,
} from '@terminus/ngx-tools/type-guards';
import {
  inputHasChanged,
  untilComponentDestroyed,
} from '@terminus/ngx-tools/utilities';
import { TS_SPACING } from '@terminus/ui/spacing';
import {
  ControlValueAccessorProviderFactory,
  TsReactiveFormBaseComponent,
  TsStyleThemeTypes,
} from '@terminus/ui/utilities';
import { filter } from 'rxjs/operators';

import { TsDropProtectionService } from './drop-protection.service';
import { TsFileImageDimensionConstraints } from './image-dimension-constraints';
import {
  TS_ACCEPTED_MIME_TYPES,
  TsFileAcceptedMimeTypes,
} from './mime-types';
import { TsSelectedFile } from './selected-file';


export interface ImageRatio {
  widthRatio: number;
  heightRatio: number;
}

// NOTE: During the last batch of dependency upgrades `DragEvent` began throwing a reference error:
// `ReferenceError: DragEvent is not defined`. A workaround is to assign it first to our own type.
// See https://github.com/thymikee/jest-preset-angular/issues/245#issuecomment-475982348
export type TsFileUploadDragEvent = DragEvent;

/**
 * The maximum file size in bytes
 *
 * NOTE: Currently nginx has a hard limit of 10mb
 */
// eslint-disable-next-line no-magic-numbers
const MAXIMUM_KILOBYTES_PER_FILE = 10 * 1024;

/**
 * Unique ID for each instance
 */
let nextUniqueId = 0;


/**
 * This is the file-upload UI Component
 *
 * @example
 * <ts-file-upload
 *              accept="['image/png', 'image/jpg']"
 *              dimensionConstraints="myConstraints" (see TsFileImageDimensionConstraints)
 *              [formControl]="myForm.get('myControl')"
 *              [hideButton]="false"
 *              id="my-id"
 *              [isDisabled]="true"
 *              maximumKilobytesPerFile="{{ 10 * 1024 }}"
 *              [multiple]="false"
 *              [progress]="myUploadProgress"
 *              ratioConstraints="['2:1', '3:4']"
 *              [seedFile]="myFile"
 *              theme="primary"
 *              (cleared)="fileWasCleared($event)"
 *              (enter)="userDragBegin($event)"
 *              (exit)="userDragEnd($event)"
 *              (selected)="handleFile($event)"
 *              (selectedMultiple)="handleMultipleFiles($event)"
 * ></ts-file-upload>
 *
 * <example-url>https://getterminus.github.io/ui-demos-release/components/file-upload</example-url>
 */
@Component({
  selector: 'ts-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  host: {
    'class': 'ts-file-upload',
    '(keydown)': 'handleKeydown($event)',
  },
  providers: [ControlValueAccessorProviderFactory<TsFileUploadComponent>(TsFileUploadComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'tsFileUpload',
})
export class TsFileUploadComponent extends TsReactiveFormBaseComponent implements OnInit, OnChanges, OnDestroy, AfterContentInit {
  /**
   * Define the default component ID
   */
  protected uid = `ts-file-upload-${nextUniqueId++}`;

  /**
   * A flag that represents an in-progress drag movement
   */
  public dragInProgress = false;

  /**
   * Store the selected file
   */
  public file: TsSelectedFile | undefined;

  /**
   * Define the flexbox layout gap
   */
  public layoutGap: string = TS_SPACING.small[0];

  /**
   * Store reference to the generated file input
   */
  private readonly virtualFileInput: HTMLInputElement;

  /**
   * Provide access to the file preview element
   */
  @ViewChild('preview', { static: false })
  public preview!: ElementRef;

  /**
   * Get the file select button text
   */
  public get buttonMessage(): string {
    return this.dragInProgress ? `Drop File${this.multiple ? 's' : ''}` : `Select File${this.multiple ? 's' : ''}`;
  }

  /**
   * Compose and expose all hints to the template
   *
   * @return An array of hints
   */
  public get hints(): string[] {
    const hints: string[] = [];
    const types: string = this.acceptedTypes.slice().map(v => v.split('/')[1]).join(', ');
    const allowsImage
      = (this.acceptedTypes.indexOf('image/png') >= 0)
      || (this.acceptedTypes.indexOf('image/jpeg') >= 0)
      || (this.acceptedTypes.indexOf('image/jpg') >= 0);

    if (allowsImage && this.supportedImageDimensions.length > 0) {
      hints.push(`Must be a valid dimension: ${this.supportedImageDimensions}`);
    }

    hints.push(`Must be ${types}`);
    hints.push(`Must be under ${this.maximumKilobytesPerFile.toLocaleString()}kb`);
    if (this.ratioConstraints) {
      hints.push(`Must have valid image ratio of ${this.ratioConstraints.join(' or ')} `);
    }

    return hints;
  }

  /**
   * Compose supported image dimensions as a string
   *
   * @return A string containing all allowed image dimensions
   */
  private get supportedImageDimensions(): string {
    let myString = '';

    // istanbul ignore else
    if (this.dimensionConstraints) {
      const constraints = this.dimensionConstraints.slice();

      for (const c of constraints) {
        // If not the first item, add a comma between the last item and the new
        if (myString.length > 0) {
          myString += ', ';
        }

        // If a fixed size
        if ((c.height.min === c.height.max) && (c.width.min === c.width.max)) {
          myString += `${c.width.min.toLocaleString()}x${c.height.min.toLocaleString()}`;
        } else {
          // Dealing with a size range
          const height = (c.height.min === c.height.max)
            ? c.height.min.toLocaleString()
            : `${c.height.min.toLocaleString()}-${c.height.max.toLocaleString()}`;
          const width = (c.width.min === c.width.max)
            ? c.width.min.toLocaleString()
            : `${c.width.min.toLocaleString()}-${c.width.max.toLocaleString()}`;
          const range = `${width}x${height}`;
          myString += range;
        }
      }
    }

    return myString;
  }

  /**
   * Define the accepted mime types
   */
  @Input()
  public set accept(value: TsFileAcceptedMimeTypes | TsFileAcceptedMimeTypes[] | undefined) {
    if (value) {
      this._acceptedTypes = coerceArray(value);
    } else {
      this._acceptedTypes = TS_ACCEPTED_MIME_TYPES.slice();
    }
  }
  // NOTE: Setter name is different to allow different types passed in vs returned
  public get acceptedTypes(): TsFileAcceptedMimeTypes[] {
    return this._acceptedTypes;
  }
  private _acceptedTypes: TsFileAcceptedMimeTypes[] = TS_ACCEPTED_MIME_TYPES.slice();

  /**
   * Define maximum and minimum pixel dimensions for images
   */
  @Input()
  public set dimensionConstraints(value: TsFileImageDimensionConstraints | undefined) {
    this._sizeConstraints = value;
  }
  public get dimensionConstraints(): TsFileImageDimensionConstraints | undefined {
    return this._sizeConstraints;
  }
  private _sizeConstraints: TsFileImageDimensionConstraints | undefined;

  /**
   * Create a form control to manage validation messages
   */
  @Input()
  public set formControl(ctrl: FormControl) {
    this._formControl = ctrl ? ctrl : new FormControl();
  }
  public get formControl(): FormControl {
    return this._formControl;
  }
  private _formControl: FormControl = new FormControl();

  /**
   * Define if the 'select files' button should be visible. DO NOT USE.
   */
  @Input()
  public hideButton = false;

  /**
   * Define an ID for the component
   */
  @Input()
  public set id(value: string) {
    this._id = value || this.uid;
  }
  public get id(): string {
    return this._id;
  }
  private _id: string = this.uid;

  /**
   * Define if the component is disabled
   */
  @Input()
  public isDisabled = false;

  /**
   * Define the maximum file size in kilobytes
   */
  @Input()
  public set maximumKilobytesPerFile(value: number) {
    this._maximumKilobytesPerFile = value || MAXIMUM_KILOBYTES_PER_FILE;
  }
  public get maximumKilobytesPerFile(): number {
    return this._maximumKilobytesPerFile;
  }
  private _maximumKilobytesPerFile: number = MAXIMUM_KILOBYTES_PER_FILE;

  /**
   * Define if multiple files may be uploaded
   */
  @Input()
  public multiple = false;

  /**
   * Define the upload progress
   */
  @Input()
  public set progress(value: number) {
    this._progress = coerceNumberProperty(value);
  }
  public get progress(): number {
    return this._progress;
  }
  private _progress = 0;

  /**
   * Define supported ratio for images
   */
  @Input()
  public set ratioConstraints(values: Array<string> | undefined) {
    if (values) {
      for (const value of values) {
        const v = value.split(':');
        const minPartsForValidRatio = 2;
        if ((v.length !== minPartsForValidRatio) || (!isNumber(v[0]) || !isNumber(v[1]))) {
          throw new Error('TsFileUploadComponent: An array of image ratios should be formatted as ["1:2", "3:4"]');
        }
      }
    }
    this._ratioConstraints = this.parseRatioStringToObject(values);
  }
  public get ratioConstraints(): Array<string> | undefined {
    return this.parseRatioToString(this._ratioConstraints);
  }
  private _ratioConstraints: Array<ImageRatio> | undefined;

  /**
   * Seed an existing file (used for multiple upload hack)
   */
  @Input()
  public set seedFile(file: File | undefined) {
    this._seedFile = file;

    if (file) {
      const newFile = new TsSelectedFile(
        file,
        this.dimensionConstraints,
        this.acceptedTypes,
        this.maximumKilobytesPerFile,
        this._ratioConstraints,
      );

      newFile.fileLoaded$.pipe(
        filter((t: TsSelectedFile | undefined): t is TsSelectedFile => t !== undefined),
        untilComponentDestroyed(this),
      ).subscribe(f => {
        this.formControl.setValue(f.file);
        this.selected.emit(f);
        this.setUpNewFile(f);
      });
    }

  }
  public get seedFile(): File | undefined {
    return this._seedFile;
  }
  private _seedFile: File | undefined;

  /**
   * Define the theme. See {@link TsStyleThemeTypes}.
   */
  @Input()
  public theme: TsStyleThemeTypes = 'primary';

  /**
   * Event emitted when the user clears a loaded file
   */
  @Output()
  public readonly cleared = new EventEmitter<boolean>();

  /**
   * Event emitted when the user's cursor enters the field while dragging a file
   */
  @Output()
  public readonly enter = new EventEmitter<boolean>();

  /**
   * Event emitted when the user's cursor exits the field while dragging a file
   */
  @Output()
  public readonly exit = new EventEmitter<boolean>();

  /**
   * Event emitted when the user drops or selects a file
   */
  @Output()
  public readonly selected = new EventEmitter<TsSelectedFile>();

  /**
   * Event emitted when the user drops or selects multiple files
   */
  @Output()
  public readonly selectedMultiple = new EventEmitter<File[]>();

  /**
   * HostListeners
   */
  @HostListener('dragover', ['$event'])
  public handleDragover(event: TsFileUploadDragEvent) {
    // istanbul ignore else
    if (!this.isDisabled) {
      this.preventAndStopEventPropagation(event);
      this.enter.emit(true);
      this.dragInProgress = true;
    }
  }

  @HostListener('dragleave', ['$event'])
  public handleDragleave(event: TsFileUploadDragEvent) {
    // istanbul ignore else
    if (!this.isDisabled) {
      this.preventAndStopEventPropagation(event);
      this.exit.emit(true);
      this.dragInProgress = false;
    }
  }

  @HostListener('drop', ['$event'])
  public handleDrop(event: TsFileUploadDragEvent) {
    // istanbul ignore else
    if (!this.isDisabled) {
      this.preventAndStopEventPropagation(event);
      this.dragInProgress = false;
      this.collectFilesFromEvent(event);
    }
  }

  @HostListener('click')
  public handleClick() {
    // istanbul ignore else
    if (!this.isDisabled) {
      this.promptForFiles();
    }
  }


  public constructor(
    private documentService: TsDocumentService,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private dropProtectionService: TsDropProtectionService,
  ) {
    super();
    this.virtualFileInput = this.createFileInput();
  }

  /**
   * Update the inner value when the formControl value is updated
   *
   * @param value - The value to set
   */
  public updateInnerValue = (value: string): void => {
    this.value = value;

    // NOTE: This `if` is to avoid: `Error: ViewDestroyedError: Attempt to use a destroyed view: detectChanges`
    // istanbul ignore else
    // eslint-disable-next-line dot-notation
    if (!this.changeDetectorRef['destroyed']) {
      this.changeDetectorRef.detectChanges();
    }
  }


  /**
   * Enable drop protection
   */
  public ngOnInit(): void {
    this.dropProtectionService.add();
    if (this.formControl) {
      this.formControl.valueChanges.pipe(
        untilComponentDestroyed(this),
      ).subscribe(() => {
        // NOTE: This `if` is to avoid: `Error: ViewDestroyedError: Attempt to use a destroyed view: detectChanges`
        // istanbul ignore else
        // eslint-disable-next-line dot-notation
        if (!this.changeDetectorRef['destroyed']) {
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }


  /**
   * Update the virtual file input when the change event is fired
   */
  public ngAfterContentInit(): void {
    this.virtualFileInput.addEventListener('change', this.onVirtualInputElementChange.bind(this));
    this.updateVirtualFileInputAttrs(this.virtualFileInput);
  }


  /**
   * Update the virtual file input's attrs when specific inputs change
   *
   * @param changes - The changed inputs
   */
  public ngOnChanges(changes: SimpleChanges): void {
    // istanbul ignore else
    if (inputHasChanged(changes, 'multiple') || inputHasChanged(changes, 'accept')) {
      this.updateVirtualFileInputAttrs(this.virtualFileInput);
      this.registerOnChangeFn(this.updateInnerValue);
    }
  }


  /**
   * Remove event listener when the component is destroyed
   */
  public ngOnDestroy(): void {
    // istanbul ignore else
    if (this.virtualFileInput) {
      this.virtualFileInput.removeEventListener('change', this.onVirtualInputElementChange.bind(this));
    }
    this.dropProtectionService.remove();
  }


  /**
   * Handle the 'enter' keydown event
   *
   * @param event - The keyboard event
   */
  public handleKeydown(event: KeyboardEvent): void {
    if (event.code === KEYS.ENTER.code) {
      this.promptForFiles();
      this.elementRef.nativeElement.blur();
    }
  }


  /**
   * Open the file selection window when the user interacts
   */
  public promptForFiles(): void {
    this.virtualFileInput.click();
  }


  /**
   * Remove a loaded file, clear validation and emit event
   *
   * @param event - The event
   */
  public removeFile(event?: Event): void {
    if (event) {
      this.preventAndStopEventPropagation(event);
    }
    this.file = undefined;
    this.clearValidationMessages();
    this.cleared.emit(true);
  }


  /**
   * Create a virtual file input
   *
   * @return The HTMLInputElement for file collection
   */
  private createFileInput(): HTMLInputElement {
    const input: HTMLInputElement = this.documentService.document.createElement('input');
    input.setAttribute('type', 'file');
    input.style.display = 'none';
    return input;
  }


  /**
   * Get all selected files from an event
   *
   * @param event - The event
   */
  private collectFilesFromEvent(event: TsFileUploadDragEvent | Event): void {
    let files: FileList | undefined;

    if (isDragEvent(event)) {
      files = (event.dataTransfer && event.dataTransfer.files) ? event.dataTransfer.files : undefined;
    }

    if (event.target && isHTMLInputElement(event.target)) {
      files = event.target.files ? event.target.files : undefined;
    }

    if ((!files || files.length < 1) && isDevMode()) {
      throw Error('TsFileUpload: Event contained no file.');
    }

    // Convert the FileList to an Array
    const filesArray: File[] = files ? Array.from(files) /* istanbul ignore next - Unreachable */ : [];

    // If multiple were selected, simply emit the event and return. Currently, this component only supports single files.
    if (filesArray.length > 1) {
      this.selectedMultiple.emit(filesArray);
      return;
    }

    const file = filesArray[0] ? filesArray[0] /* istanbul ignore next - Unreachable */ : undefined;

    // istanbul ignore else
    if (file) {
      const newFile = new TsSelectedFile(
        file,
        this.dimensionConstraints,
        this.acceptedTypes,
        this.maximumKilobytesPerFile,
        this._ratioConstraints
      );

      newFile.fileLoaded$.pipe(
        filter((t: TsSelectedFile | undefined): t is TsSelectedFile => !!t),
        untilComponentDestroyed(this),
      ).subscribe(f => {
        this.formControl.setValue(f.file);
        this.selected.emit(f);
        this.setUpNewFile(f);
      });
    }
  }

  /**
   * Register our custom onChange function
   *
   * @param fn - The onChange function
   */
  private registerOnChangeFn(fn: Function): void {
    // istanbul ignore else
    if (this.formControl) {
      this.formControl.registerOnChange(fn);
    }
  }


  /**
   * Set file and set up preview and validations
   *
   * @param file - The file
   */
  private setUpNewFile(file: TsSelectedFile): void {
    if (!file) {
      return;
    }
    this.file = file;
    this.setValidationMessages(file);
    this.changeDetectorRef.markForCheck();
  }


  /**
   * Listen for changes to the virtual input
   *
   * @param event - The event
   */
  private onVirtualInputElementChange(event: Event): void {
    // istanbul ignore else
    if (!this.isDisabled) {
      this.collectFilesFromEvent(event);
      this.virtualFileInput.value = '';
    }
  }


  /*
   * Stops event propagation
   *
   * NOTE: Making this static seems to break our tests.
   */
  private preventAndStopEventPropagation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }


  /**
   * Update the attributes of the virtual file input based on @Inputs
   *
   * @param input - The HTML input element
   */
  private updateVirtualFileInputAttrs(input: HTMLInputElement): void {
    const hasMultipleSetting: boolean = input.hasAttribute('multiple');

    // Should set multiple
    // istanbul ignore else
    if (this.multiple && !hasMultipleSetting) {
      this.virtualFileInput.setAttribute('multiple', 'true');
    }

    // Should remove multiple
    // istanbul ignore else
    if (!this.multiple && hasMultipleSetting) {
      this.virtualFileInput.removeAttribute('multiple');
    }

    // Should set accept
    // istanbul ignore else
    if (this.acceptedTypes) {
      this.virtualFileInput.setAttribute('accept', this.acceptedTypes.toString());
    }
  }


  /**
   * Set validation messages
   *
   * @param file - The file
   */
  private setValidationMessages(file: TsSelectedFile | undefined): void {
    if (!file) {
      return;
    }

    const errors: ValidationErrors = {};
    const responses: {[key: string]: ValidationErrors} = {
      fileSize: {
        valid: false,
        actual: file.size,
        max: this.maximumKilobytesPerFile,
      },
      fileType: {
        valid: false,
        actual: file.mimeType,
        accepted: this.acceptedTypes.join(', '),
      },
      imageDimensions: {
        valid: false,
        actual: file.dimensions,
      },
      imageRatio: {
        valid: false,
        actual: file.width / file.height,
      },
    };

    const validations = Object.keys(file.validations);

    for (let i = 0; i < validations.length; i += 1) {
      const key: string = validations[i];
      if (!file.validations[key]) {
        errors[key] = responses[key];
      }
    }

    if (Object.keys(errors).length === 0) {
      this.formControl.setErrors(null);
    } else {
      this.formControl.setErrors(errors);
    }
    this.formControl.markAsTouched();
    this.changeDetectorRef.markForCheck();
  }


  /**
   * Clear all validation messages
   */
  private clearValidationMessages(): void {
    this.formControl.setErrors(null);
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Parse ratio from Array of string to Array of ImageRatio
   * @param ratios - Array of string
   * @return - Array of ImageRatio
   */
  private parseRatioStringToObject(ratios: Array<string> | undefined): Array<ImageRatio> | undefined {
    if (!ratios) {
      return undefined;
    }
    const parsedImageRatio: Array<ImageRatio> = [];
    ratios.map(r => parsedImageRatio.push({
      widthRatio: Number(r.split(':')[0]),
      heightRatio: Number(r.split(':')[1]),
    }));
    return parsedImageRatio;
  }

  /**
   * Parse ratio from Array of ImageRatio to Array of string
   * @param ratios - Array of ImageRatio
   * @return - Array of string
   */

  private parseRatioToString(ratios: Array<ImageRatio> | undefined): Array<string> | undefined {
    if (!ratios) {
      return undefined;
    }
    const parsedRatio: Array<string> = [];
    ratios.map(r => parsedRatio.push(`${r.widthRatio.toString()  }:${  r.heightRatio.toString()}`));
    return parsedRatio;
  }


  /**
   * Function for tracking for-loops changes
   *
   * @param index - The item index
   * @return The unique ID
   */
  public trackByFn(index): number {
    return index;
  }

}
