class SkiTableConfig {
  maxHeight;
  hideableColumns;
  showUnsorted;
  isDownloadable;
  pagination;

  constructor(maxHeight="800px", hideableColumns=true, showUnsorted=false, isDownloadable=true, pagination=true) {
    this.maxHeight = maxHeight;
    this.hideableColumns = hideableColumns;
    this.showUnsorted = showUnsorted;
    this.isDownloadable = isDownloadable;
    this.pagination = pagination;
  }
}