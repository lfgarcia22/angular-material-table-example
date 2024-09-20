import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Group } from '../model/group.model';
import { ExampleData, ExampleDataHeaders } from './table-example.data';

@Component({
  selector: 'app-table-example',
  templateUrl: './table-example.component.html',
  styleUrls: ['./table-example.component.scss'],
})
export class TableExampleComponent implements OnInit {
  headers = ExampleDataHeaders;
  groupedHeaders: string[] = [];
  dataSource = new MatTableDataSource<any | Group>([]);

  ngOnInit(): void {
    this.groupBy();
    this.dataSource.filterPredicate = this.matTableFilterPredicate;
    this.dataSource.filter = performance.now().toString();
  }

  dragAndGroupHeaders = ($ev: CdkDragDrop<string[]>) => {
    const target = $ev.event.target as HTMLElement;
    if (target.dataset['id'] === 'headerGrouped') {
      const dataset = $ev.item.element.nativeElement.dataset;
      const { isHeader, column } = dataset;
      if (isHeader && column) {
        if (!this.groupedHeaders.includes(column)) {
          const index = this.headers.indexOf(column);
          const columns = this.headers.splice(index, 1);
          this.groupedHeaders.push(...columns);
          this.groupBy();
        }
      }
    } else if (target.dataset['section'] === 'dragArea') {
      moveItemInArray(this.headers, $ev.previousIndex, $ev.currentIndex);
      this.groupBy();
    }
  };

  dragAndSortGroupedHeaders = ($ev: CdkDragDrop<string[]>) => {
    const target = $ev.event.target as HTMLElement;
    if (target.dataset['section'] === 'dragArea') {
      const dataset = $ev.item.element.nativeElement.dataset;
      const { column } = dataset;
      if (column && !this.headers.includes(column)) {
        const index = this.groupedHeaders.indexOf(column);
        const columns = this.groupedHeaders.splice(index, 1);
        this.headers.push(...columns);
        this.groupBy();
      }
    } else if (target.dataset['id'] === 'headerGrouped') {
      moveItemInArray(this.groupedHeaders, $ev.previousIndex, $ev.currentIndex);
      this.groupBy();
    }
  };

  removeFromGroup = ($ev: string) => {
    const index = this.groupedHeaders.indexOf($ev);
    const columns = this.groupedHeaders.splice(index, 1);
    this.headers.push(...columns);
    this.groupBy();
  };

  collapseExpandRow = (row: any) => {
    row.expanded = !row.expanded;
    this.dataSource.filter = performance.now().toString();
  };

  isGrouped = (_: number, item: any): boolean => {
    return item.level;
  };

  private groupBy = () => {
    const rootGroup = new Group();
    rootGroup.expanded = true;
    this.dataSource.data = this.getSubLevel(
      ExampleData.biddingProcessPlansApproved,
      0,
      this.groupedHeaders,
      rootGroup
    );
  };

  private matTableFilterPredicate = (data: any | Group, _: string): boolean => {
    if (data instanceof Group) {
      return data.visible;
    }

    const groupRows = this.dataSource.data.filter((row) => {
      if (!(row instanceof Group)) {
        return false;
      }
      let match = true;
      this.groupedHeaders.forEach((column) => {
        if (
          !(row as any)[column] ||
          !data[column] ||
          (row as any)[column] !== data[column]
        ) {
          match = false;
        }
      });
      return match;
    });

    if (groupRows.length === 0) {
      return true;
    }
    const parent = groupRows[0] as Group;
    return parent.visible && parent.expanded;
  };

  private getSubLevel = (
    data: any[],
    level: number,
    groupByColumns: string[],
    parent: Group
  ): any[] => {
    if (level >= groupByColumns.length) {
      return data;
    }
    const groups = this.uniqueBy(
      data.map((row) => {
        const result = new Group();
        result.level = level + 1;
        result.parent = parent;
        for (let i = 0; i <= level; i++) {
          (result as any)[groupByColumns[i]] = row[groupByColumns[i]];
        }
        return result;
      }),
      JSON.stringify
    );

    const currentColumn = groupByColumns[level];
    let subGroups: any[] = [];
    groups.forEach((group: any) => {
      const rowsInGroup = data.filter(
        (row) => group[currentColumn] === row[currentColumn]
      );
      group.totalCounts = rowsInGroup.length;
      const subGroup = this.getSubLevel(
        rowsInGroup,
        level + 1,
        groupByColumns,
        group
      );
      subGroup.unshift(group);
      subGroups = subGroups.concat(subGroup);
    });
    return subGroups;
  };

  private uniqueBy = (a: any, key: any) => {
    const seen: any = {};
    return a.filter((item: any) => {
      const k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  };
}
