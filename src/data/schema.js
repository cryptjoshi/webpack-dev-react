import {
    GraphQLSchema as Schema,
    GraphQLObjectType as ObjectType,
  } from 'graphql';
  import me from './queries/me';
  const schema = new Schema({
    query: new ObjectType({
      name: 'Query',
      fields: {
        me
    }
}),
mutation: new ObjectType({
    name: 'Mutation',
    fields:{}
})
})
export default schema;
    