import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';

import { TsTabContentDirective } from './../body/tab-content.directive';
import { TsTabLabelDirective } from './../label/tab-label.directive';



// Unique ID for each instance
let nextUniqueId = 0;


/**
 * An individual tab component
 *
 * @example
 * <ts-tab
 *               [isDisabled]="true"
 *               label="First"
 *               ariaLabel="My label"
 *               ariaLabelledby="myId"
 * >
 *               My tab content!
 * </ts-tab>
 *
 * <example-url>https://getterminus.github.io/ui-demos-master/components/tabs</example-url>
 */
@Component({
  selector: 'ts-tab',
  templateUrl: './tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'tsTab',
})
export class TsTabComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Define a unique ID for every instance
   */
  private id: number = nextUniqueId++;

  /**
   * Portal that will be the hosted content of the tab
   */
  private contentPortal: TemplatePortal | null = null;

  /**
   * Emits whenever the internal state of the tab changes
   */
  readonly stateChanges = new Subject<void>();

  /**
   * The relatively indexed position where 0 represents the center, negative numbers are left, and positive numbers represent the right.
   */
  public position: number | null = null;

  /**
   * The initial relatively index origin of the tab if it was created and selected after there was already a selected tab.
   * Provides context of what position the tab should originate from.
   */
  public origin: number | null = null;

  /**
   * Whether the tab is currently active
   */
  public isActive = false;

  /**
   * Provides quick access to the content poratl
   */
  public get content(): TemplatePortal | null {
    return this.contentPortal;
  }

  /**
   * Content for the tab label given by `<ng-template tsTabLabel>`
   */
  @ContentChild(TsTabLabelDirective)
  public templateLabel: TsTabLabelDirective;

  /**
   * Template provided in the tab content that will be used if present, used to enable lazy-loading
   */
  // FIXME: Switch to `{read: TemplateRef, static: true}` once Angular v8 hits
  @ContentChild(TsTabContentDirective, {read: TemplateRef})
  public explicitContent: TemplateRef<any>;

  /**
   * Template inside the TsTabComponent view that contains an `<ng-content>`
   */
  // FIXME: Switch to `{static: true}` once Angular v8 hits
  @ViewChild(TemplateRef)
 public implicitContent: TemplateRef<any>;

 /**
  * Define if the tab is disabled
  */
  @Input()
  public isDisabled = false;

  /**
   * Simple text label for the tab (used when there is no template label)
   */
  @Input()
  public label = '';

  /**
   * Aria label for the tab
   */
  @Input()
  public ariaLabel: string | undefined;

  /**
   * Reference to the element that the tab is labelled by.
   *
   * NOTE: Will be cleared if `aria-label` is set at the same time.
   */
  @Input()
  public ariaLabelledby: string | undefined;


  constructor(
    private viewContainerRef: ViewContainerRef,
  ) {}


  /**
   * Inject the tab content
   */
  public ngOnInit(): void {
    this.contentPortal = new TemplatePortal(this.explicitContent || this.implicitContent, this.viewContainerRef);
  }


  /**
   * Trigger event emitter for property changes
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('label') || changes.hasOwnProperty('isDisabled')) {
      this.stateChanges.next();
    }
  }


  /**
   * Clean up any subscriptions
   */
  public ngOnDestroy(): void {
    this.stateChanges.complete();
  }

}