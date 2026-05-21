package com.housewith.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.housewith.persistence.account.UserRepository;
import com.housewith.domain.account.Profile;
import com.housewith.domain.account.User;
import com.housewith.dto.account.EmailCheckRequest;
import com.housewith.dto.account.LoginRequest;
import com.housewith.dto.account.LoginResponse;
import com.housewith.dto.account.SlotCreateRequest;
import com.housewith.dto.account.SlotItem;
import com.housewith.dto.account.SlotLoginRequest;
import com.housewith.dto.account.SlotLoginResponse;
import com.housewith.dto.account.SlotUpdateRequest;
import com.housewith.dto.account.UserCreateRequest;
import com.housewith.persistence.account.ProfileRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 조회로 설정, 수정이 필요하다면 @Transactional로 데이터 조작을 허용
public class AccountService {
    // DB 레포지토리 선언
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    // 이메일 중복 검사
    public boolean checkEmailDuplicate(EmailCheckRequest request) {
        return userRepository.existsByEmail(request.getEmail());
    }

    //회원가입 로직
    @Transactional
    public Long signUp(UserCreateRequest request) {
        // 동시성 요청이나 우회 가입을 원천 차단하기 위한 2차 검증 방어벽
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        // Spring Security 단방향 해시 알고리즘(BCrypt)을 이용한 암호화 처리
        String encryptedPassword = passwordEncoder.encode(request.getPassword());

        // 엔티티 내부에서 초기값(currentQuestionId=0, isReceivingQuestion=false)이 강제된 안전한 빌더 호출
        User user = User.builder()
                .email(request.getEmail())
                .password(encryptedPassword) // 암호화된 비밀번호 주입
                .phoneNumber(request.getPhoneNumber())
                .groupName(request.getGroupName())
                .build();

        return userRepository.save(user).getId();
    }

    // 로그인 및 슬롯 목록 조회
    public LoginResponse login(LoginRequest request) {
        // 이메일 존재 여부 확인
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        // 입력된 평문 비밀번호와 DB의 암호화된 해시값을 비교 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 해당 유저에 속한 모든 슬롯 조회 
        List<Profile> profiles = profileRepository.findByUser_Id(user.getId());

        // 조회된 엔티티 리스트를 DTO 리스트로 변환
        List<SlotItem> slots = profiles.stream()
                .map(p -> new SlotItem(
                        p.getId(),
                        p.getNickname(),
                        p.getEmojiId(),
                        p.getBackgroundId(),
                        p.getCustomProfileImage()
                ))
                .toList();

        // ***임시*** 프론트엔드 연동을 위한 임시(Mock) JWT 토큰 발급 ***임시***
        String mockAccessToken = "mock-jwt-token-for-user-" + user.getId();
        
        return new LoginResponse(
                mockAccessToken,
                "Bearer",
                user.getId(),
                user.getGroupName(),
                slots
        );
    }

    // 가족 구성원 슬롯
    @Transactional
    public Long createSlot(Long userId, SlotCreateRequest request, String uploadedImageUrl) {
        long currentSlotCount = profileRepository.countByUser_Id(userId);
        if (currentSlotCount >= 10) {
            throw new IllegalStateException("가족 슬롯은 최대 10개까지만 생성할 수 있습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 가족 계정입니다."));

        Profile profile = Profile.builder()
                .user(user)
                .nickname(request.getNickname())
                .pinCode(request.getPinCode()) // 핀번호는 기획에 따라 평문 유지
                .emojiId(request.getProfileEmoji())
                .backgroundId(request.getProfileBackground())
                .customProfileImage(uploadedImageUrl)
                .build();

        return profileRepository.save(profile).getId();
    }

    // 가족 슬롯 접속 (핀번호 로그인)
    @Transactional
    public SlotLoginResponse loginSlot(SlotLoginRequest request) {
        Profile profile = profileRepository.findById(request.getSlotId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 슬롯입니다."));

        // 슬롯 핀코드 평문 비교
        if (!profile.getPinCode().equals(request.getPinCode())) {
            throw new IllegalArgumentException("핀번호가 일치하지 않습니다.");
        }

        // 접속 시간 최신화 (더티 체킹)
        profile.updateLastAccessTime(LocalDateTime.now());
        
        return new SlotLoginResponse(
                profile.getId(),
                profile.getNickname(),
                profile.getEmojiId(),
                profile.getBackgroundId(),
                profile.getCustomProfileImage()
        );
    }

    //가족 프로필 정보 수정
    @Transactional
    public void updateSlot(Long slotId, SlotUpdateRequest request, String updatedImageUrl) {
        Profile profile = profileRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 슬롯입니다."));

        // 엔티티 정보 갱신 (실제 Profile 엔티티의 변경 메서드 호출)
        profile.modifyProfileDetails(
                request.getNickname(),
                request.getPinCode(),
                request.getProfileEmoji(),
                request.getProfileBackground(),
                updatedImageUrl
        );
    }
}
