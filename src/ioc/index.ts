import { AppConfig } from "config";
import serviceIoc from "./services.ioc";
import { Container } from "typescript-ioc";
import controllerIoc from "./controller.ioc";
import { IocGroupMapping } from "ioc-mapping";

/**
 * Configure IOC with confid provided.
 *
 * @param config App Config
 */
export const configure = (config: AppConfig) => {
  const mapping: IocGroupMapping = [
    { bindName: "config", to: config },
    ...serviceIoc,
    ...controllerIoc,
  ];

  Container.configure(...mapping);
};
