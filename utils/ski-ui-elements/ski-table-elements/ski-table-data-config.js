class SkiTableDataConfig {
  content;
  sortValue;
  primarySortType;  // Valid options to override basic string comparison ["dateISO", "number"]
  downloadInfo;
  styles;

  constructor(content, sortValue=undefined, primarySortType=undefined, downloadInfo=undefined, styles={}) {
    this.content = content;
    this.sortValue = sortValue;
    this.primarySortType = primarySortType;
    this.downloadInfo = downloadInfo;
    this.styles = styles;
  }
}