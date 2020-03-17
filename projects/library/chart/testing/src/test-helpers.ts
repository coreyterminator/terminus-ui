import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { noop } from '@terminus/ngx-tools/utilities';
import { TsChartComponent } from '@terminus/ui/chart';


/**
 * Get the DebugElement for {@link TsChartComponent}
 *
 * @param fixture - The component fixture
 * @returns The DebugElement
 */
export const getChartDebugElement =
  (fixture: ComponentFixture<any>): DebugElement => fixture.debugElement.query(By.directive(TsChartComponent));

/**
 * Get the component instance for a {@link TsChartComponent}
 *
 * @param fixture - The component fixture
 * @returns The instance
 */
export function getChartInstance(fixture: ComponentFixture<any>): TsChartComponent {
  const debugElement = getChartDebugElement(fixture);
  return debugElement.componentInstance;
}

/**
 * Expose an Amcharts service mock for consumers to use.
 */
export class AmChartsServiceMock {
  public get amCharts() {
    return {
      core: {
        color: noop,
        options: {},
        create: () => ({
          series: {
            clear: noop,
            push: () => ({
              dataFields: {},
              tooltip: { background: {} },
            }),
          },
          responsive: { enabled: false },
          colors: { list: [] },
          xAxes: {
            push: () => ({
              dataFields: {},
              renderer: {
                grid: { template: {} },
                labels: { template: {} },
              },
            }),
          },
          yAxes: {
            push: () => ({
              title: {},
              numberFormatter: {},
              tooltip: {},
            }),
          },
          dispose: noop,
        }),
      },
      charts: {
        CategoryAxis: noop,
        ValueAxis: noop,
        XYCursor: () => ({}),
        Legend: () => ({}),
        LineSeries: () => ({}),
        ColumnSeries: () => ({}),
        XYChart: {},
        PieChart: {},
        RadarChart: {},
        TreeMap: {},
        SankeyDiagram: {},
        ChordDiagram: {},
      },
      maps: { MapChart: {} },
    };
  }
}
