export default {

    path: '/',
    children: [
        require('./home').default,
    ],
    action: async ({next})=>{
        const route = await next();
   
        // Provide default values for title, description etc.
        route.title = `${route.title || 'Untitled Page'}`;
        route.description = route.description || '';
    
        return route;
    }
}