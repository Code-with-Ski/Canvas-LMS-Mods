class SkiTableHeadingConfig {
  name;
  isSortable;
  isHidden;
  isLocked;

  constructor(name, isSortable=true, isHidden=false, isLocked=false) {
    this.name = name;
    this.isSortable = isSortable;
    this.isHidden = isHidden;
    this.isLocked = isLocked;
  }
}