/**
 * Static route file in react-router-config scheme
 *
 * Used for getting component tree in SSR only (prefetch data).
 *
 * Only these are added which need to prefetch data!
 */

import App from '../components/App'
import Todo from '../components/Todo'
import TodoList from '../components/Todo/List'

export default [
    {
        name: 'app',
        component: App,
        routes: [
            {
                name: 'todo',
                path: '/todo',
                component: Todo,
                routes: [
                    {
                        name: 'todo-list',
                        path: '/todo/:list',
                        exact: true,
                        component: TodoList
                    }
                ]
            }
        ]
    }
];
