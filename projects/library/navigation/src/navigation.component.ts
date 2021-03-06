import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { groupBy } from '@terminus/ngx-tools/utilities';
import { BehaviorSubject } from 'rxjs';


/**
 * Define the user object interface
 */
export interface TsUser {
  /**
   * The user's full name
   */
  fullName: string;
}


/**
 * Base allowed keys for an item passed to the {@link TsNavigationComponent}
 */
export interface NavigationItemBase {
  /**
   * The value to use as the item text
   */
  name: string;

  /**
   * Define if the item should only be allowed in the secondary navigation
   */
  // TODO: API change for clarity
  alwaysHidden: boolean;

  /**
   * Define if the item is disabled
   */
  isDisabled?: boolean;

  /**
   * Define if the item is for admin functionality only
   */
  // TODO: API change for clarity. Should likely be something more general that defines how the link is treated rather than where it takes
  // the user.
  isForAdmin?: boolean;
}


/**
 * Link specific keys for an item passed to the {@link TsNavigationComponent}
 */
export interface TsNavigationLinkItem extends NavigationItemBase {
  /**
   * The destination for items with a 'navigate' action. Single strings are used for external
   * locations while an array of strings are used for routerLinks
   */
  destination: string | string[];

  /**
   * Whether this link should navigate via the router or standard href
   */
  isExternal?: boolean;
}


/**
 * Action specific keys for an item passed to the {@link TsNavigationComponent}
 */
export interface TsNavigationActionItem extends NavigationItemBase {
  /**
   * The action to emit upon interaction
   */
  action: {
    type: string;
  };
}


/**
 * Determine if a navigation item is a {@link TsNavigationLinkItem}
 *
 * @param x - The item to check
 * @return True if the item is a TsNavigationLinkItem
 */
export function isLinkItem(x: TsNavigationLinkItem | TsNavigationActionItem): x is TsNavigationLinkItem {
  return !!(x as TsNavigationLinkItem).destination;
}


/**
 * Define the allowed keys and types for an item passed to the {@link TsNavigationComponent}
 */
export type TsNavigationItem = TsNavigationLinkItem | TsNavigationActionItem;


/**
 * Define the expected response from the {@link TsNavigationComponent} emitter
 */
export interface TsNavigationPayload {
  /**
   * The mouse click event
   */
  event: MouseEvent;

  /**
   * The selected item
   */
  action: {
    type: string;
  };
}

const DEFAULT_USER_NAME_MAX_LENGTH = 20;
const DEFAULT_WELCOME_MESSAGE_MAX_LENGTH = 20;


/**
 * This is the navigation UI Component
 *
 * @example
 * <ts-navigation
 *              [items]="navigationItems$ | async"
 *              [user]="currentUser$ | async"
 *              userNameLength="20"
 *              welcomeMessage="Hi!"
 *              welcomeMsgLength="25"
 *              (itemSelected)="myMethod($event)"
 * ></ts-navigation>
 *
 * <example-url>https://getterminus.github.io/ui-demos-release/components/navigation</example-url>
 */
@Component({
  selector: 'ts-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  host: { class: 'ts-navigation' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'tsNavigation',
})
export class TsNavigationComponent implements OnInit, AfterViewInit {
  /**
   * Store a pristine copy of the navigation items
   */
  private pristineItems!: TsNavigationItem[];

  /**
   * Getter to return the available navigation width
   *
   * @return The available navigation space
   */
  private get availableSpace(): number {
    const NAV_WIDTH_BUFFER = 10;

    return this.visibleItemsList.nativeElement.offsetWidth - NAV_WIDTH_BUFFER;
  }

  /**
   * Define an array of widths at which to break the navigation
   */
  private breakWidths: number[] = [];

  /**
   * Define the list of hidden items
   */
  public hiddenItems: BehaviorSubject<TsNavigationItem[]> = new BehaviorSubject([] as TsNavigationItem[]);

  /**
   * Getter to return the user's full name if it exists
   *
   * @return The user's full name
   */
  public get usersFullName(): string | null {
    const userExists = !!this.user;
    const nameExists = userExists && (this.user.fullName.length > 0);

    return (userExists && nameExists) ? this.user.fullName : null;
  }

  /**
   * The collection of visible navigation items
   */
  public visibleItems: BehaviorSubject<TsNavigationItem[]> = new BehaviorSubject([] as TsNavigationItem[]);

  /**
   * Getter to return the count of visible items
   *
   * @return The number of visible items
   */
  public get visibleItemsLength(): number {
    return this.visibleItems.getValue().length;
  }

  /**
   * Accept the array of navigation items and trigger setup
   */
  @Input()
  public set items(value: TsNavigationItem[]) {
    // Filter out disabled items
    const enabledItems = value.filter((item: TsNavigationItem) => !item.isDisabled);

    this.pristineItems = enabledItems;
    this.setUpInitialArrays(this.pristineItems);
    this.generateBreakWidths();
    this.updateLists();
  }

  /**
   * Accept the user data
   */
  @Input()
  public user!: TsUser;

  /**
   * Define the user name length
   */
  @Input()
  public userNameLength = DEFAULT_USER_NAME_MAX_LENGTH;

  /**
   * Define the welcome message
   */
  @Input()
  public welcomeMessage = 'Welcome';

  /**
   * Define the welcome message length
   */
  @Input()
  public welcomeMsgLength = DEFAULT_WELCOME_MESSAGE_MAX_LENGTH;

  /**
   * Element reference for visible list items
   */
  @ViewChild('visibleItemsList', { static: true })
  public visibleItemsList!: ElementRef;

  /**
   * Query list of all elements from the visible items list
   */
  @ViewChildren('visibleLinkElement')
  public visibleLinkElement!: QueryList<ElementRef>;

  /**
   * Emit the click event with the {@link TsNavigationPayload}
   */
  @Output()
  public readonly action: EventEmitter<TsNavigationPayload> = new EventEmitter();

  /**
   * Trigger a layout update when the window resizes
   */
  @HostListener('window:resize')
  public onResize(): void {
    this.updateLists();
  }


  /**
   * Inject services
   */
  constructor(
   private changeDetectorRef: ChangeDetectorRef,
  ) {}


  /**
   * Set up initial link groups
   */
  public ngOnInit(): void {
    this.setUpInitialArrays(this.pristineItems);
  }


  /**
   * Trigger initial layout update after the view initializes
   */
  public ngAfterViewInit(): void {
    this.generateBreakWidths();
    this.updateLists();
    this.changeDetectorRef.detectChanges();
  }


  /**
   * Generate the array of breakWidths
   */
  private generateBreakWidths(): void {
    let totalSpace = 0;
    this.breakWidths.length = 0;

    // Loop through the visible links
    this.visibleLinkElement.forEach((item: ElementRef) => {
      // Tally up the total space
      totalSpace += item.nativeElement.offsetWidth;

      // Add the total space as a breakpoint
      this.breakWidths.push(totalSpace);
    });
  }


  /**
   * Clone the nav items and split into the initially visible/hidden lists
   *
   * @param items - The complete list of navigation items
   */
  private setUpInitialArrays(items: TsNavigationItem[]): void {
    // Clone the items and define the external flag for links only
    const allItems = items.map(i => {
      const item: TsNavigationItem = { ...i };
      if (isLinkItem(item)) {
        item.isExternal = this.isExternalLink(item.destination);
      }
      return item;
    });

    // Create an object with the arrays separated
    const splitArrays = groupBy(allItems, 'alwaysHidden');

    // Push the separated arrays
    this.visibleItems.next(splitArrays.false);
    this.hiddenItems.next(splitArrays.true);

    this.changeDetectorRef.detectChanges();
  }


  /**
   * Move items between the two lists as required by the available space
   */
  private updateLists(): void {
    const requiredSpace = this.breakWidths[this.visibleItemsLength - 1];

    // If there is not enough space
    if (requiredSpace > this.availableSpace) {
      // Pull the last link out of the visible array
      const currentVisible: TsNavigationItem[] = this.visibleItems.getValue();
      const itemToMove = currentVisible.pop();
      const updatedHiddenArray: TsNavigationItem[] = this.hiddenItems.getValue();

      // If an item was found, add it to the beginning of the hidden items array
      // istanbul ignore else
      if (itemToMove) {
        updatedHiddenArray.unshift(itemToMove);
      }

      // Push out the updated value
      this.hiddenItems.next(updatedHiddenArray);

      // Trigger another layout check
      this.updateLists();
    } else if (this.availableSpace > this.breakWidths[this.visibleItemsLength]) {
      // Else, if there is more than enough space

      // Pull the first item from the hidden array
      const currentHidden = this.hiddenItems.getValue();
      const itemToMove = currentHidden.shift();
      const updatedVisibleArray: TsNavigationItem[] = this.visibleItems.getValue();

      // If an item was found, add it to the beginning of the hidden items array
      // istanbul ignore else
      if (itemToMove) {
        updatedVisibleArray.push(itemToMove);
      }

      // Add it to the end of the visible array
      this.visibleItems.next(updatedVisibleArray);
    }

    this.changeDetectorRef.detectChanges();
  }


  /**
   * If the destination is a string and begins with `http`
   *
   * @param destination - The destination to check
   * @return Boolean determining if the link is external
   */
  public isExternalLink(destination: string | string[]): boolean {
    return destination.indexOf('http') >= 0;
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
