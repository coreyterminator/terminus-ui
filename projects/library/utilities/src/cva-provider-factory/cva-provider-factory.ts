import {
  ExistingProvider,
  forwardRef,
  Type,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';


export function ControlValueAccessorProviderFactory<T>(type: Type<T>): ExistingProvider {
  return {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => type),
    multi: true,
  };
}
