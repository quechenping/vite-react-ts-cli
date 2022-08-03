# vite-react-ts-cli 脚手架搭建

### 设计思想

src 文件夹下目录结构将为

```bash
|-- src
    |-- components  # 基础组件,	例如Input框的封装
    |-- config      # 公共配置, 各项静态数据
    |-- features    # 业务组件, 由基础组件组合构建的业务模块组件
    |-- hook        # 自定义hook
    |-- pages       # 路由页面组件
    |-- providers   # 自定义provider
    |-- routes      # 路由管理
    |-- utils       # 工具库

    |-- App.tsx     # 主组件
    |-- main.tsx    # 入口文件
```

APP.tsx 中使用如下格式

```react
import { AppProvider } from '@/providers/app'
import { AppRoutes } from '@/routes'

<AppProvider>
	<AppRoutes />
</AppProvider>
```

其中`AppProvider`定义主文件下需要的 Provider，例如 Suspense、ErrorBoundary、MobxProvider 等

其中`AppRoutes`定义路由组件，以数组 map 的形式进行配置，后续只需调整该数组即可添加路由

### 创建基础脚手架模版

1. 在 node 安装的情况下，本文用 yarn 进行安装

先执行如下命令

```shell
yarn create vite	// vite版本为3.0
```

选择`template`为`react-ts`

2. 选择使用`pnpm`管理包工具，执行如下命令即安装依赖且启动项目服务

```shell
pnpm i
pnpm dev
```

3. 删除多余文件，只保留`main.tsx`、`App.tsx`文件,并移除 tsx 文件中引用的各项依赖

```bash
|-- src
    |-- App.tsx			# 主组件
    |-- main.tsx		# 入口文件
```

继续执行`pnpm dev`确保项目没有报错

将 src 文件夹下添加如下文件夹

```bash
|-- src
    |-- components  # 基础组件
    |-- config      # 公共配置
    |-- features    # 业务组件
    |-- hook        # 自定义hook
    |-- pages       # 路由页面组件
    |-- providers   # 自定义provider
    |-- routes      # 路由管理
    |-- utils       # 工具库

    |-- App.tsx     # 主组件
    |-- main.tsx    # 入口文件
```

### 配置 alias

先安装`@types/node`

```bash
pnpm add -D @types/node
```

编辑`vite.config.ts`文件

```tsx
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src') // 路径别名
    },
    extensions: ['.js', '.json', '.ts', 'tsx'] // 使用路径别名时想要省略的后缀名，可以自己 增减
  }
})
```

编辑`tsconfig.json`文件

```tsx
# 添加如下配置
"compilerOptions":{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### 配置 proxy

编辑`vite.config.ts`文件

```tsx
server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
```

### 集成 react-router-dom

执行如下命令安装`react-router-dom`

```bash
pnpm add react-router-dom
```

在`routers`文件夹下创建`index.tsx`文件，并写入

```react
# routers/index.tsx
import { useRoutes } from 'react-router-dom'

import routers from './routers'

export const AppRoutes = () => {
  const element = useRoutes([...routers])
  return <>{element}</>
}

```

在`routers`文件夹下定义`routers.tsx`文件，并写入如下代码，其中`About`和`Home`为在`pages`中定义好的组件，内容随意

```react
# routers/routers.tsx
import { lazy } from 'react'

const About = lazy(() => import('@/pages/About'))
const Home = lazy(() => import('@/pages/Home'))

const routers = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/about',
    element: <About />
  }
]
export default routers
```

### 集成 react-error-boundary

因为该脚手架想使用全 hook 形式开发，所以引用该插件获取组件错误

在`providers`文件夹下定义`app.tsx`文件，并写入如下代码

```react
# providers/app.tsx
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter as Router } from 'react-router-dom'

type AppProviderProps = {
  children: React.ReactNode
}

const ErrorFallback = () => {
  return (
    <div>
      <h2>页面发生错误...</h2>
    </div>
  )
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Router>{children}</Router>
      </ErrorBoundary>
    </Suspense>
  )
}
```

### 调整 App.tsx 文件

```react
import { AppProvider } from '@/providers/app'
import { AppRoutes } from '@/routes'

<AppProvider>
	<AppRoutes />
</AppProvider>
```

至此已经可以进行业务开发

### 集成 antd 并按需加载

先安装 antd 及 less

```shell
pnpm add antd
pnpm add -D less
```

在`App.tsx`文件中引入 antd.less

```react
import 'antd/dist/antd.less'
```

此时在 Home 组件中引入 Button 组件

```react
# src/pages/Home/index.tsx
import {Button} from 'antd'

const Home = () => {
  return <Button>click</Button>
}

export default Home
```

执行`pnpm build`进行打包，查看打包产物可以看到存在一个特别大的 css 文件，因此需要对 antd.less 进行按需加载

执行如下命令安装`vite-plugin-style-import`,`vite-plugin-style-import`引用了`consola`，需要安装一下

```shell
pnpm add -D vite-plugin-style-import consola
```

调整`vite.config.ts`文件

```shell
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'

export default defineConfig({
  ...
  plugins:[
    ...
    createStyleImportPlugin({
      resolves: [ElementPlusResolve()],
      libs: [
        {
          libraryName: 'antd',
          esModule: true,
          resolveStyle: (name) => {
            return `antd/lib/${name}/style/index.less`
          }
        }
      ]
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#4377FE' //设置antd主题色
        }
      }
    }
  }
})
```

配置完成后即可删除在`App.tsx`文件中引入的 antd.less

此时再执行`pnpm build`查看打包产物，可以发现 css 文件已经小很多

### 集成 eslint

执行如下命令安装依赖

```shell
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hook eslint-import-resolver-typescript
```

eslint-plugin-react : 对 react 代码定制的 eslint 规则

eslint-plugin-react-hook: 对 react-hook 代码定制的 eslint 规则

eslint-import-resolver-typescript: 识别 ts 项目 alias 相对路径

在.eslintrc.js 中添加如下

```js
# .eslintrc.js
extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
]
```

#### 集成 eslint-plugin-import

对于代码中的 import 过多时难以管理，使用`eslint-plugin-import`插件管理

```shell
pnpm add -D eslint-plugin-import
```

#### `import/order`学习

`groups`：对导入模块进行分组

| 配置项   | 备注           |
| -------- | -------------- |
| builtin  | 内置模块       |
| external | 外部模块       |
| internal | 内部引用       |
| sibling  | 兄弟依赖       |
| parent   | 父节点依赖     |
| index    | index 文件依赖 |
| unknown  | 未知依赖       |

使用： groups: ['builtin', 'external', 'internal', 'sibling', 'parent', 'index', 'unknown']

`pathGroups`：通过路径自定义分组

| 配置项         | 备注                                    |
| -------------- | --------------------------------------- |
| pattern        | 最小匹配（不包括`builtin`，`external`） |
| patternOptions | pattern 匹配的参数设定                  |
| group          | 在上述的分组中选择                      |
| position       | 插入 group 的位置                       |

`newlines-between`：每个分组之间换行

`alphabetize`：排序

示例：

```js
# .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: { ecmaVersion: 8, sourceType: 'module' },
  ignorePatterns: ['node_modules/*'],
  extends: ['eslint:recommended'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      settings: {
        react: { version: 'detect' },
        'import/resolver': {
          typescript: {},
          node: {
            extensions: ['.js', '.jsx', 'ts', 'tsx']
          }
        }
      },
      extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
      ],
      rules: {
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', ['internal', 'parent', 'sibling', 'index'], 'unknown'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true }
          }
        ]
      }
    }
  ]
}

```

### 集成 husky、lint-staged、commitlint

husky 插件的作用就是在 git hook 中添加操作, lint-staged 则可以准确的定位到暂存区的代码并对其操作

大致流程：

`git commit`前通过`pre-commit（husky-hook）`执行`lint-staged`脚本校验代码规范

如果校验失败，则阻止提交

继续通过`commit-msg（husky-hook）`执行`commitlint`脚本校验提交规范

如果校验失败，则阻止提交

#### githooks

| git hook         | 执行时机          | 说明                                                                                   |
| ---------------- | ----------------- | -------------------------------------------------------------------------------------- |
| applypatch-msg   | git am 执行前     | 默认情况下，如果 commit-msg 启用的话，applpatch-msg 钩子在启用时会运行 commit-msg 钩子 |
| post-applypatch  | git am 执行后     | 这个钩子主要用于通知，不能影响 git-am 的结果                                           |
| pre-commit       | git commit 执行前 | 可以使用 git commit --no verify 命令绕过该钩子                                         |
| pre-merge-commit | git merge 执行前  | 可以使用 git merge --no verify 命令绕过该钩子                                          |
| commit-msg       | git commit 执行前 | 可以使用 git commit --no verify 命令绕过该钩子                                         |
| post-commit      | git commit 执行后 | 不影响 git commit 的结果                                                               |

#### git commit 提交规范

使用 angular 规范的 commitlint，格式要求：

```html
<type
  >(<scope
    >):
    <subject>
      <BLANK LINE>
        <body>
          <BLANK LINE> <footer></footer></BLANK></body></BLANK></subject></scope
></type>
```

- `<type>`代表某次提交的类型，比如是修复一个 bug 或是增加一个 feature，具体类型如下：

| 类型     | 描述                                                     |
| -------- | -------------------------------------------------------- |
| feat     | 新增 feature                                             |
| fix      | 修复 bug                                                 |
| docs     | 仅仅修改了文档，比如 README, CHANGELOG, CONTRIBUTE 等等; |
| style    | 仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑;      |
| refactor | 代码重构，没有加新功能或者修复 bug                       |
| perf     | 优化相关，比如提升性能、体验                             |
| test     | 测试用例，包括单元测试、集成测试等                       |
| chore    | 改变构建流程、或者增加依赖库、工具等                     |
| revert   | 回滚到上一个版本                                         |

- `scope`：说明 commit 影响的范围。scope 依据项目而定，例如在业务项目中可以依据菜单或者功能模块划分，如果是组件库开发，则可以依据组件划分。

- `subject`:是 commit 的简短描述；

- `body`:提交代码的详细描述；

- `footer`:如果代码的提交是不兼容变更或关闭缺陷，则 footer 必需，否则可以省略。

#### 实现

执行如下命令安装依赖

因为使用 angular 规范的 commitlint，所以安装`config-angular`插件

```
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-angular
```

在`package.json 中添加如下：

```json
 "lint-staged": {
    "*.{js,ts,tsx,jsx}": [
      "eslint --ext .js,.ts,.jsx,.tsx --fix",
      "prettier --write"
    ],
    "*.{html,css,less,scss,md}": [
      "prettier --write"
    ]
  }
```

控制台中执行如下命令初始化`husky`，会在根目录生成一个`.husky`目录且生成一个`pre-commit`文件

```shell
npx husky install
```

1. 生成一个`pre-commit`钩子

```shell l
npx husky add .husky/pre-commit "npx lint-staged"
```

pre-commit`文件应该如下

```shell
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

解释：其中`pre-commit`中的`npx lint-staged`即为该 hook 触发时执行的脚本，而`lint-staged`会通过`package.json`中配置的`lint-staged`项去进行暂存区的校验

2. 生成一个`commit-msg `钩子

```shell
npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"
```

在根目录创建一个`commitlint.config.js`文件

```js
module.exports = {
  extends: ['@commitlint/config-angular'],
  // 以下时我们自定义的规则
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'bug', // 此项特别针对bug号，用于向测试反馈bug列表的bug修改情况
        'feat', // 新功能（feature）
        'fix', // 修补bug
        'docs', // 文档（documentation）
        'style', // 格式（不影响代码运行的变动）
        'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'revert', // feat(pencil): add ‘graphiteWidth’ option (撤销之前的commit)
        'merge' // 合并分支， 例如： merge（前端页面）： feature-xxxx修改线程地址
      ]
    ]
  }
}
```

至此配置全部完成
