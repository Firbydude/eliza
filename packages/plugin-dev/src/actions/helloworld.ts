
import {
    ActionExample,
    composeContext,
    Content,
    generateText,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    type Action,
} from "@elizaos/core";

export const helloWorldAction: Action = {
    name: "HELLO_WORLD",
    similes: [
        "HELLO",
    ],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Respond but perform no additional action. This is the default if the agent is speaking and not doing anything additional.",
    handler: async (_runtime: IAgentRuntime, _message: Memory, _state?: State, _options?: {
        [key: string]: unknown;
    }, _callback?: HandlerCallback
    ): Promise<boolean> => {
        const foo = "heyo dev work?";
        const helloWorld = `${foo}
 _    _      _ _        __          __        _     _ _
| |  | |    | | |       \\ \\        / /       | |   | | |
| |__| | ___| | | ___    \\ \\  /\\  / /__  _ __| | __| | |
|  __  |/ _ \\ | |/ _ \\    \\ \\/  \\/ / _ \\| '__| |/ _\  |
| |  | |  __/ | | (_) |    \\  /\\  / (_) | |  | | (_| |_
|_|  |_|\\___|_|_|\\___/      \\/  \\/ \\___/|_|  |_|\\__,_(_)
        `;

        const template = `
        Extract the search term from the user's message. The message is:
        ${_message.content.text}
        Only response with the search term. Do not include any other text.
        `;

        // this will prepend the rest of the agent context for handing off to the LLM.
        const context = await composeContext({
            state: _state,
            template: template,
        })

        // this will invoke and generate the response from the LLM.
        const response = await generateText({
            runtime: _runtime,
            // prompt: template,  /* this can be omitted if prompt is composed into the context */
            context: context,
            modelClass: ModelClass.SMALL,
            stop: ["\n"],
        })

        // this will create a new memory with the response from the LLM. The memory
        // will be saved and allow the agent to "recall" the response in the context of future messages.
        const memory: Memory = {
            userId: _message.agentId,
            agentId: _message.agentId,
            roomId: _message.roomId,
            content: {
                text: helloWorld,
                action: "HELLO_WORLD_RESPONSE",
                source: _message.content.source,
            } as Content,
        };

        await _runtime.messageManager.createMemory(memory);

        // const newState = await _runtime.updateRecentMessageState()
        // const newState = _runtime.composeState(_message, {
        //     additionalData: helloWorld,
        // });

        _callback({
            text: helloWorld,
        });

        // Success
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "hello world" },
            },
            {
                user: "{{agentName}}",
                content: { text: "", action: "HELLO_WORLD" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "can you show me hello world?" },
            },
            {
                user: "{{agentName}}",
                content: { text: "", action: "HELLO_WORLD" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "print hello world" },
            },
            {
                user: "{{agentName}}",
                content: { text: "", action: "HELLO_WORLD" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "display hello world please" },
            },
            {
                user: "{{agentName}}",
                content: { text: "", action: "HELLO_WORLD" },
            },
        ]
    ] as ActionExample[][],
} as Action;
