import { MemberEntity } from "@domain/member/entities/member.entity";
import type { IMemberRepository } from "@domain/member/repositories/member.repository.interface";
import {
  CreateMemberInput,
  createMember,
} from "@domain/member/use-cases/create-member";
import { deleteMember } from "@domain/member/use-cases/delete-member";
import { getMember } from "@domain/member/use-cases/get-member";
import { listOrganizationMembers } from "@domain/member/use-cases/list-organization-members";
import { listUserOrganizations } from "@domain/member/use-cases/list-user-organizations";
import {
  UpdateMemberInput,
  updateMember,
} from "@domain/member/use-cases/update-member";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

@Injectable()
export class MemberService {
  constructor(
    @Inject("IMemberRepository")
    private readonly memberRepository: IMemberRepository,
  ) {}

  async createMember(input: CreateMemberInput): Promise<MemberEntity> {
    try {
      const result = await createMember(input, this.memberRepository);
      return result.member;
    } catch (error) {
      if (error.message.includes("already exists")) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  async getMember(
    userId: string,
    organizationId: string,
  ): Promise<MemberEntity> {
    const result = await getMember(
      { userId, organizationId },
      this.memberRepository,
    );

    if (!result.member) {
      throw new NotFoundException(
        `Member not found: ${userId} in organization ${organizationId}`,
      );
    }

    return result.member;
  }

  async updateMember(input: UpdateMemberInput): Promise<MemberEntity> {
    try {
      const result = await updateMember(input, this.memberRepository);
      return result.member;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async deleteMember(userId: string, organizationId: string): Promise<void> {
    try {
      await deleteMember({ userId, organizationId }, this.memberRepository);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async listOrganizationMembers(
    organizationId: string,
  ): Promise<MemberEntity[]> {
    const result = await listOrganizationMembers(
      { organizationId },
      this.memberRepository,
    );
    return result.members;
  }

  async listUserOrganizations(userId: string): Promise<MemberEntity[]> {
    const result = await listUserOrganizations(
      { userId },
      this.memberRepository,
    );
    return result.members;
  }
}
