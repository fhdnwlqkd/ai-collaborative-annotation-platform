import nextConfig from "eslint-config-next/core-web-vitals";
import nextTsConfig from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [...nextConfig, ...nextTsConfig, prettierConfig];

export default eslintConfig;
