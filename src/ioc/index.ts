import { AppConfig } from "config";
import serviceIoc from "./services.ioc";
import controllerIoc from "./controller.ioc";
import { IocGroupMapping } from "ioc-mapping";

export default (config: AppConfig): IocGroupMapping => [
  { bindName: "config", to: config },
  ...serviceIoc,
  ...controllerIoc,
];
