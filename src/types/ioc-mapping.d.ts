import { NamespaceConfiguration } from "typescript-ioc/dist/model";
import { ConstantConfiguration, ContainerConfiguration } from "typescript-ioc";

type IocGroupMapping = Array<
  ContainerConfiguration | ConstantConfiguration | NamespaceConfiguration
>;
