import {
  ConstantConfiguration,
  Container,
  ContainerConfiguration,
} from "typescript-ioc";
import { NamespaceConfiguration } from "typescript-ioc/dist/model";

export const initializeIocAndApp = (
  config: Array<
    ContainerConfiguration | ConstantConfiguration | NamespaceConfiguration
  >
) => {
  Container.configure(...config);
  return require("../../../src/app").default;
};
