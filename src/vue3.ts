import { createApp, h } from 'vue';
import { store1, store2 } from './cross-framework-store'
import type { ComputedRef, ShallowRef } from 'vue';
import { shallowRef, onScopeDispose, computed } from 'vue';
import type { StoreApi } from 'zustand';

export type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

export type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'subscribe'>;

export function useStore<TState, StateSlice = TState>(
  store: ReadonlyStoreApi<TState>,
  selector?: (state: TState) => StateSlice,
): ComputedRef<StateSlice> {
  const selectorFn = selector || ((state: TState) => state as unknown as StateSlice);

  const state = shallowRef(selectorFn(store.getState())) as ShallowRef<StateSlice>;

  const unsubscribe = store.subscribe(() => {
    const newState = selectorFn(store.getState());
    if (!Object.is(state.value, newState)) {
      state.value = newState;
    }
  });

  onScopeDispose(() => {
    unsubscribe();
  });

  return computed(() => state.value);
}

export function create<TState>(store: ReadonlyStoreApi<TState>) {
  return function <StateSlice = TState>(selector?: (state: TState) => StateSlice): ShallowRef<StateSlice> {
    return useStore(store, selector);
  };
}
const app = {
    name: 'Main',
    setup() {
        const button2 = useStore(store2, (s) => s.button2)
        return () => h('div', [
            h('div', [
                'vue3 store1',
                h('button', {
                    onClick() {
                        store1.changeButton1(store1.data.value.button1 + '1')
                    }
                }, ['vue click']),
                store1.data.value.button1,
            ]),
            h('div', [
                'vue3 store2',
                h('button', {
                    onClick() {
                        store2.getState().onChangeButton1(button2.value + '1')
                    }
                }, ['vue click']),
                button2.value,
            ])
        ])
    },

}


const App = {
    setup() {
    },
    render: () => h(app),
};

export function mountVue3(container: HTMLElement) {
    createApp(App).mount(container);
}
