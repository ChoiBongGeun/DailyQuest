package com.dailyquest.backend.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Save user successfully")
    void saveUser() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .password("password123")
                .nickname("tester")
                .build();

        // when
        User savedUser = userRepository.save(user);

        // then
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getEmail()).isEqualTo("test@test.com");
        assertThat(savedUser.getNickname()).isEqualTo("tester");
    }

    @Test
    @DisplayName("Find user by email")
    void findByEmail() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .password("password123")
                .nickname("tester")
                .build();
        userRepository.save(user);

        // when
        Optional<User> found = userRepository.findByEmail("test@test.com");

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@test.com");
    }

    @Test
    @DisplayName("Check email exists")
    void existsByEmail() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .password("password123")
                .nickname("tester")
                .build();
        userRepository.save(user);

        // when & then
        assertThat(userRepository.existsByEmail("test@test.com")).isTrue();
        assertThat(userRepository.existsByEmail("notexist@test.com")).isFalse();
    }
}
