import { GraphQLError } from 'graphql';
import { createMessage, getMessages } from './db/messages.js';
import {PubSub} from "graphql-subscriptions";

const pubSub = new PubSub();

export const resolvers = {
  Query: {
    messages: (_root, _args, { user }) => {
      if (!user) throw unauthorizedError();
      return getMessages();
    },
  },

  Mutation: {
    addMessage: async(_root, { text }, { user }) => {
      if (!user) throw unauthorizedError();
      const message = await createMessage(user, text);

      await pubSub.publish('MESSAGE_ADDED', {
        messagesAdded: message
      });

      return message
    },
  },
  Subscription: {
    messagesAdded: {
      subscribe:  (_root, _args, {user}) => {
        if(!user) {
          throw unauthorizedError();
        }
        return pubSub.asyncIterator('MESSAGE_ADDED')
      },
    }
  }
};

function unauthorizedError() {
  return new GraphQLError('Not authenticated', {
    extensions: { code: 'UNAUTHORIZED' },
  });
}
