export default class ShapeAnimatorManager {
  static tag = 42;

  static nextTag(): number {
    this.tag += 1;
    return this.tag;
  }
}
