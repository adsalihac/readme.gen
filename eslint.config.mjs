import nextConfig from 'eslint-config-next';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = [...nextConfig, ...nextTs];

export default eslintConfig;

