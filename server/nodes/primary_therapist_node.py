from langchain_openai import ChatOpenAI
from core.config import get_settings
from models.therapy import TherapyState
from database.user_profile import get_user_profile
from prompts.chat_prompts import get_system_prompt
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from tools.save_to_journal_tool import save_to_journal_tool

settings = get_settings()
llm = ChatOpenAI(
    model=settings.OPENAI_MODEL, 
    temperature=0.7
).bind_tools([save_to_journal_tool])

def primary_therapist_node(state: TherapyState) -> TherapyState:
    user_profile = get_user_profile(user_id=state.user_id)
    is_first_message = not state.history or len(state.history) == 0

    system_prompt = SystemMessage(content=get_system_prompt(is_first_message, user_profile))
    human_prompt = HumanMessage(content=state.prompt)

    prompt = [system_prompt] + state.history + [human_prompt]

    llm_response = llm.invoke(prompt)
    node_response = ""

    if getattr(llm_response, "tool_calls", None):
        for tool_call in llm_response.tool_calls:
            if tool_call["name"] == "save_text_to_journal":
                args = dict(tool_call["args"])
                args["user_id"] = state.user_id
                try:
                    res = save_to_journal_tool.invoke(args)
                    converted_response = AIMessage(content=res)
                    return { "history": state.history + [converted_response] } 
                except Exception as e:
                    node_response = f"Whoops! Failed to save journal entry. Please try again."
                    print(f"Failed to save journal entry: {e} \n")
            else:
                print(f"Tool call not found: {tool_call['name']} \n")
                node_response = llm_response.content

    converted_response = AIMessage(content=node_response)
    return { "history": state.history + [converted_response] } 


