import ReactDOM from 'react-dom/client';
import {useStore} from 'zustand'
import { createElement as h, useCallback, useSyncExternalStore } from 'react'
import { watch } from 'vue';
import {store1, store2 }from './cross-framework-store'

export function useVueRefAsStore<T, R>(ref: T, selector: (refValue: T) => R): R {
  const _selector = useCallback(() => selector(ref), [ref, selector]);
  
  const subscribe = useCallback((callback: () => void) => {
    // 使用 Vue 的 watch 来监听 ref 的变化
    const stop = watch(() => _selector(), callback, { 
      flush: 'sync' // 使用同步模式确保立即触发更新
    });
    // 返回 unsubscribe 函数
    return stop;
  }, [ref]);

  return useSyncExternalStore(subscribe, _selector);
}


function App() {
  const button1 = useVueRefAsStore(store1, (state) => state.data.value.button1);
  const changeButton1 = useVueRefAsStore(store1, (state) => state.changeButton1)
  const button2 = useStore(store2, (state) => state.button2);
  const changeButton2 = useStore(store2, (state) => state.onChangeButton1);
  return h('div', {
    children: [
      h('div', {
        children: [
          'react store 1',
          h('button', {
            onClick: () => {
              changeButton1(button1 + 1)
            },
            children: ['react click']
          }),
          `buttonValue, ${button1}`
        ]
      }),
      h('div', {
        children: [
          'react store 2',
          h('button', {
            onClick: () => {
              changeButton2(button2 + 1)
            },
            children: ['react click2']
          }),
          `buttonValue, ${button2}`
        ]
      })
    ]
  });
}
export function mountReact(container: Element) {
  const app = ReactDOM.createRoot(container)
  app.render(h(App));
}
