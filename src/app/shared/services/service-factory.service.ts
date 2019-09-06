import {
  ComponentFactoryResolver,
  forwardRef,
  Injectable,
  Injector,
  ReflectiveInjector,
  StaticProvider
} from "@angular/core";
import { ClassType } from "class-transformer/ClassTransformer";

@Injectable({
  providedIn: "root"
})
export class ServiceFactoryService {
  constructor(private injector: Injector) {}

  getService<T>(
    cls: ClassType<T>,
    injections: StaticProvider[],
    deps: any[]
  ): T {
    const injector: Injector = Injector.create({
      providers: [...injections, { provide: cls, deps: [...deps] }],
      parent: this.injector
    });

    return injector.get(cls);
  }
}
