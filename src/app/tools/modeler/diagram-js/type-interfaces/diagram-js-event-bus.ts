export interface DiagramJsEventBus {
  fire(command: string, value: any): void;
  on(event: string | string[], option1: any, option2?: any): void;
}
