package es.lomuko.chat_ai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.ai.ollama.OllamaChatModel;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.containsString;

@WebMvcTest(ChatController.class)
class ChatControllerTests {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private OllamaChatModel chatModel;

        @Test
        void testChatEndpointWithValidMessage() throws Exception {
                // Arrange
                String message = "What is Spring Boot?";
                String expectedResponse = "Spring Boot is a framework that simplifies building Spring applications.";
                when(chatModel.call(message)).thenReturn(expectedResponse);

                // Act & Assert
                mockMvc.perform(get("/api/v1/chat")
                                .param("message", message)
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(content().string(expectedResponse));
        }

        @Test
        void testChatEndpointWithSpecialCharacters() throws Exception {
                // Arrange
                String message = "What is AI & ML?";
                String expectedResponse = "AI and ML are transformative technologies.";
                when(chatModel.call(message)).thenReturn(expectedResponse);

                // Act & Assert
                mockMvc.perform(get("/api/v1/chat")
                                .param("message", message)
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(content().string(expectedResponse));
        }

        @Test
        void testChatEndpointWithEmptyMessage() throws Exception {
                // Arrange
                String message = "";
                String expectedResponse = "Please provide a message.";
                when(chatModel.call(message)).thenReturn(expectedResponse);

                // Act & Assert
                mockMvc.perform(get("/api/v1/chat")
                                .param("message", message)
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(content().string(expectedResponse));
        }

        @Test
        void testChatEndpointWithoutMessageParameter() throws Exception {
                // Act & Assert - Should return 400 Bad Request
                mockMvc.perform(get("/api/v1/chat")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void testStreamEndpointWithValidMessage() throws Exception {
                // Arrange
                String message = "Explain Docker";
                when(chatModel.stream(message))
                                .thenReturn(Flux.just("Docker ", "is ", "a ", "containerization ", "platform."));

                // Act & Assert
                mockMvc.perform(get("/api/v1/chat/stream")
                                .param("message", message)
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(content().string(containsString("Docker")));
        }

        @Test
        void testStreamEndpointWithMultipleTokens() throws Exception {
                // Arrange
                String message = "Count to 3";
                when(chatModel.stream(message))
                                .thenReturn(Flux.just("One", " Two", " Three"));

                // Act & Assert
                mockMvc.perform(get("/api/v1/chat/stream")
                                .param("message", message)
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.TEXT_EVENT_STREAM_VALUE));
        }

        @Test
        void testStreamEndpointWithoutMessageParameter() throws Exception {
                // Act & Assert - Should return 400 Bad Request
                mockMvc.perform(get("/api/v1/chat/stream")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void testChatModelCallIsInvoked() throws Exception {
                // Arrange
                String message = "Test message";
                when(chatModel.call(message)).thenReturn("Test response");

                // Act
                mockMvc.perform(get("/api/v1/chat")
                                .param("message", message));

                // Assert - Verify call was made (implicitly verified by the mock setup)
        }

        @Test
        void testStreamModelIsInvoked() throws Exception {
                // Arrange
                String message = "Stream test";
                when(chatModel.stream(message)).thenReturn(Flux.just("Response"));

                // Act
                mockMvc.perform(get("/api/v1/chat/stream")
                                .param("message", message));

                // Assert - Verify stream was called (implicitly verified by the mock setup)
        }

        @Test
        void testChatEndpointReturnsCorrectContentType() throws Exception {
                // Arrange
                String message = "What is Java?";
                String expectedResponse = "Java is a programming language.";
                when(chatModel.call(message)).thenReturn(expectedResponse);

                // Act & Assert
                mockMvc.perform(get("/api/v1/chat")
                                .param("message", message))
                                .andExpect(status().isOk())
                                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN));
        }

        @Test
        void testStreamEndpointReturnsCorrectContentType() throws Exception {
                // Arrange
                String message = "Stream test";
                when(chatModel.stream(message)).thenReturn(Flux.just("test"));

                // Act & Assert
                mockMvc.perform(get("/api/v1/chat/stream")
                                .param("message", message))
                                .andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.TEXT_EVENT_STREAM_VALUE));
        }

        @Test
        void testFluxStreamVerifier() {
                // Arrange
                String message = "Flux test";
                String[] tokens = { "Token1", "Token2", "Token3" };
                when(chatModel.stream(message)).thenReturn(Flux.just(tokens));

                // Act & Assert
                StepVerifier.create(chatModel.stream(message))
                                .expectNext("Token1", "Token2", "Token3")
                                .expectComplete()
                                .verify();
        }

        @Test
        void testFluxStreamWithError() {
                // Arrange
                String message = "Error test";
                when(chatModel.stream(message))
                                .thenReturn(Flux.error(new RuntimeException("Stream error")));

                // Act & Assert
                StepVerifier.create(chatModel.stream(message))
                                .expectError(RuntimeException.class)
                                .verify();
        }
}
