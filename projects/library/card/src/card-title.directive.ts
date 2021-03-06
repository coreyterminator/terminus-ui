import {
  Directive,
  Host,
  HostBinding,
  Input,
  isDevMode,
  Optional,
  SkipSelf,
} from '@angular/core';
import { coerceBooleanProperty } from '@terminus/ngx-tools/coercion';
import {
  TsStyleThemeTypes,
  TsUILibraryError,
} from '@terminus/ui/utilities';

import { TsCardComponent } from './card.component';


@Directive({ selector: '[tsCardTitle]' })
export class TsCardTitleDirective {
  /**
   * Option to add a border to the header
   */
  @Input()
  public set tsTitleAccentBorder(value: boolean) {
    // istanbul ignore else
    if (coerceBooleanProperty(value)) {
      this.tsCardTitle = `${this.tsCardTitle} c-card__title-accent-border`;
    }
  }

  /**
   * Define the component theme
   */
  @Input()
  public theme: TsStyleThemeTypes = 'primary';

  /**
   * Set the card title class
   */
  @HostBinding('class')
  public tsCardTitle = 'c-card__title';

  /**
   * Verify the directive is nested within a {@link TsCardComponent}
   */
  constructor(
    @Optional() @Host() @SkipSelf() parent: TsCardComponent,
  ) {
    if (!(parent instanceof TsCardComponent) && isDevMode()) {
      throw new TsUILibraryError(`The 'tsCardTitle' directive must be inside a <ts-card> component.`);
    }
  }

}
