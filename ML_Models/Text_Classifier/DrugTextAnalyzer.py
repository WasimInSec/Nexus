from typing import List, Dict, Any
from langchain_core.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain_ollama import ChatOllama
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import Optional

@dataclass
class AnalysisResult:
    classification: str
    identified_slang: List[str]
    decoded_terms: Dict[str, str]

class DrugTextAnalyzer:
    """
    A class for analyzing text to identify and decode potential drug-related content.
    Uses LangChain with Groq LLM for processing.
    """

    def __init__(self, model_name: str = "wizardlm2", temperature: float = 0):
        """
        Initialize the DrugTextAnalyzer with specified model parameters.
        """
        # Load environment variables
        load_dotenv()

        # Initialize LLM
        self.llm = ChatOllama(
            model=model_name,
            temperature=temperature,
            max_tokens=None,
            timeout=120,
            max_retries=3
        )

        # Define response schemas
        self._setup_schemas()
        
        # Create prompt template
        self._setup_prompt_template()

    def _setup_schemas(self) -> None:
        """Set up the response schemas for structured output parsing."""
        self.response_schemas = [
            ResponseSchema(
                name="classification",
                description="The classification of the text (positive, negative, coded)"
            ),
            ResponseSchema(
                name="identified_slang",
                description="A list of any slang or drug-related terms identified"
            ),
            ResponseSchema(
                name="decoded_terms",
                description="A dictionary mapping slang terms to their decoded drug meanings"
            ),
        ]
        self.output_parser = StructuredOutputParser.from_response_schemas(self.response_schemas)

    def _setup_prompt_template(self) -> None:
        """Set up the prompt template for text analysis."""
        template = """
        Analyze the following text for potential drug-related content. 
        
        Guidelines:
        - Classify the text as one of: "positive" (explicit drug references), "negative" (unrelated to drugs), or "coded" (uses slang/cryptic language)
        - Identify any drug-related slang terms, abbreviations, or emojis
        - Provide decoded meanings for identified terms
        
        Classification criteria:
        - Positive: Explicit references to drugs, paraphernalia, pricing, or delivery
        - Negative: No drug-related content
        - Coded: Uses slang, emojis, or cryptic language for potential drug references
        
        Input text: {user_input}
        
        {format_instructions}
        """
        
        self.prompt = PromptTemplate(
            input_variables=["user_input"],
            partial_variables={"format_instructions": self.output_parser.get_format_instructions()},
            template=template
        )

    def process_single_input(self, text: str) -> Optional[AnalysisResult]:
        """
        Process a single text input and return structured analysis.
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
            
        try:
            # Format the prompt with the input text
            formatted_prompt = self.prompt.format(user_input=text)
            
            # Get response from LLM
            output = self.llm.invoke(formatted_prompt)
            
            # Parse the response
            parsed = self.output_parser.parse(output.content)
            
            # Convert to AnalysisResult
            return AnalysisResult(
                classification=parsed["classification"],
                identified_slang=parsed["identified_slang"],
                decoded_terms=parsed["decoded_terms"]
            )
            
        except Exception as e:
            print(f"Error processing text: {str(e)}")
            return None

    def process_input(self, text: str) -> List[AnalysisResult]:
        """
        Process multiple sentences from input text and return analysis for each.
        """
        if not text or not text.strip():
            return []
            
        # Split text into sentences and filter empty ones
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        results = []
        for sentence in sentences:
            result = self.process_single_input(sentence)
            if result:
                results.append(result)
                
        return results

    def batch_process(self, texts: List[str]) -> List[AnalysisResult]:
        """
        Process multiple texts in batch.
        """
        results = []
        for text in texts:
            result = self.process_single_input(text)
            if result:
                results.append(result)
        return results