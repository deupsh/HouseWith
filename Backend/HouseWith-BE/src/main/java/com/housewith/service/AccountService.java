package com.housewith.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.housewith.domain.account.Profile;
import com.housewith.domain.account.User;
import com.housewith.dto.account.EmailCheckRequest;
import com.housewith.dto.account.LoginRequest;
import com.housewith.dto.account.LoginResponse;
import com.housewith.dto.account.SlotCreateRequest;
import com.housewith.dto.account.SlotItem;
import com.housewith.dto.account.SlotLoginRequest;
import com.housewith.dto.account.SlotLoginResponse;
import com.housewith.dto.account.SlotPinUpdateRequest;
import com.housewith.dto.account.SlotUpdateRequest;
import com.housewith.dto.account.UserCreateRequest;
import com.housewith.global.security.JwtTokenProvider;
import com.housewith.persistence.account.ProfileRepository;
import com.housewith.persistence.account.UserRepository;

import lombok.RequiredArgsConstructor;

/** 작성자: 백승훈
 * 작성 시간: 2026-05-20/1641i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-22/1428i
 * 수정 내용: 슬롯 삭제, 회원 탈퇴 메소드 추가 (박성현 - 2026-05-22/0915i)
 * PIN 번호 수정 분리 (박성현 - 2026-05-22/1111i)
 * 슬롯 정보 Resopnse가 PK만 반환 → SlotItem DTO 반환 (박성현 - 2026-05-22/1428i)S
 * 역할: 가족 그룹 계정의 보안 인증(회원가입/로그인)과 개별 구성원 슬롯의 전체 생명주기(생성/수정/접속/삭제)를 총괄하는 서비스 */

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 조회로 설정, 수정이 필요하다면 @Transactional로 데이터 조작을 허용
public class AccountService {
    // DB 레포지토리 선언
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    // JWT 토큰 발급용 필드 선언
    private final JwtTokenProvider jwtTokenProvider;

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
                        p.getPinCode(),
                        p.getNickname(),
                        p.getEmojiId(),
                        p.getBackgroundId(),
                        p.getCustomProfileImage()
                ))
                .toList();

        String AccessToken = jwtTokenProvider.createToken(user.getId(), user.getGroupName());
        
        return new LoginResponse(
                AccessToken,
                "Bearer",
                user.getId(),
                user.getGroupName(),
                slots
        );
    }
    
    // 단순 슬롯 조회 (로그인과 연관 X)
    public List<SlotItem> getSlots(Long userId) {
        List<Profile> profiles = profileRepository.findByUser_Id(userId);
        return profiles.stream()
                .map(p -> new SlotItem(
                        p.getId(),
                        p.getPinCode(),
                        p.getNickname(),
                        p.getEmojiId(),
                        p.getBackgroundId(),
                        p.getCustomProfileImage()
                ))
                .toList();
    }

    // 가족 구성원 슬롯
    @Transactional
    public SlotItem createSlot(Long userId, SlotCreateRequest request, String uploadedImageUrl) {
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

        Profile savedProfile = profileRepository.save(profile);

        // API 명세서에 맞게 SlotItem DTO로 변환하여 리턴
        return new SlotItem(
                savedProfile.getId(),
                savedProfile.getPinCode(),
                savedProfile.getNickname(),
                savedProfile.getEmojiId(),
                savedProfile.getBackgroundId(),
                savedProfile.getCustomProfileImage()
        );
    }

    // 가족 슬롯 접속 (핀번호 로그인)
    @Transactional
    public SlotLoginResponse loginSlot(SlotLoginRequest request) {
        Profile profile = profileRepository.findById(request.getSlotId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 슬롯입니다."));

		// 1. 해당 슬롯에 PIN 번호가 설정되어 있는 경우에만 검증 로직 수행
		if (profile.getPinCode() != null && !profile.getPinCode().isEmpty()) {

			// 2. 프론트엔드가 PIN을 안 보냈거나, 틀리게 보낸 경우 차단
			if (request.getPinCode() == null || !profile.getPinCode().equals(request.getPinCode())) {
				throw new IllegalArgumentException("핀번호가 일치하지 않거나 입력되지 않았습니다.");
			}
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

    // 가족 프로필 정보 수정
    @Transactional
    public void updateSlot(Long slotId, Long userId, SlotUpdateRequest request, String updatedImageUrl) {
        Profile profile = profileRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 슬롯입니다."));

     // 권한 방어벽 추가: 내 가족 슬롯이 맞는지 검증
        if (!profile.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }
        
        // 엔티티 정보 갱신 (실제 Profile 엔티티의 변경 메서드 호출)
        profile.modifyProfileDetails(
                request.getNickname(),
                request.getProfileEmoji(),
                request.getProfileBackground(),
                updatedImageUrl
        );
    }

    // 가족 계정 비밀번호 검증 (PIN 수정 진입 전 1차 확인용)
    public void verifyAccountPassword(Long userId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 계정입니다."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("계정 비밀번호가 일치하지 않습니다.");
        }
    }

    // 슬롯 PIN 번호 변경 및 해제
    @Transactional
    public void updateSlotPin(Long slotId, Long userId, SlotPinUpdateRequest request) {
        Profile profile = profileRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 슬롯입니다."));

        if (!profile.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("해당 슬롯의 설정을 변경할 권한이 없습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 계정입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("계정 비밀번호가 일치하지 않습니다.");
        }

        // 데이터 정제 (Cleansing): 빈 문자열이 들어와도 확실하게 NULL로 치환
        String targetPin = (request.getNewPinCode() == null || request.getNewPinCode().isBlank()) 
                           ? null 
                           : request.getNewPinCode();

        profile.changePinCode(targetPin);
    }
    
    // 슬롯 삭제
    @Transactional
    public void deleteSlot(Long slotId, Long userId) {
        Profile profile = profileRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 슬롯입니다."));

        // 무결성 검증: 다른 가족 계정의 슬롯을 삭제하려는 악의적 요청 차단
        if (!profile.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("해당 슬롯을 삭제할 권한이 없습니다.");
        }

        profileRepository.delete(profile);
    }

    // 회원 탈퇴 (가족 그룹 전체 삭제)
    @Transactional
    public void withdrawUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 계정입니다."));

        userRepository.delete(user);
    }
}