import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';
import { CreateUserInviteSchema, AcceptInviteSchema } from '@cms/validation';
import { Request } from 'express';

interface IRequestUser {
  id: string;
  roles: string[];
  email: string;
}

@ApiTags('User Management (Admin)')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'List platform users' })
  async list() {
    const items = await this.usersService.list();
    return { success: true, data: items };
  }

  @Get('roles')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'List assignable roles' })
  async roles() {
    const items = await this.usersService.listRoles();
    return { success: true, data: items };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Create and invite a new user' })
  async create(@Body() body: unknown, @Req() req: Request) {
    const parsed = CreateUserInviteSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.errors[0]?.message || 'Invalid request');
    const actor = req.user as IRequestUser;
    const data = await this.usersService.create(parsed.data, { id: actor.id, roles: actor.roles }, actor.email);
    return { success: true, data, message: 'Invite sent.' };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Update a user (name, role, status)' })
  async update(
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; roleId?: string; status?: string },
    @Req() req: Request,
  ) {
    const actor = req.user as IRequestUser;
    const data = await this.usersService.update(id, body, { id: actor.id, roles: actor.roles });
    return { success: true, data };
  }

  @Post(':id/resend-invite')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Resend an invite email to a pending user' })
  async resendInvite(@Param('id') id: string) {
    const data = await this.usersService.resendInvite(id);
    return { success: true, ...data };
  }

  @Post(':id/deactivate')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Deactivate a user and revoke their sessions' })
  async deactivate(@Param('id') id: string) {
    const data = await this.usersService.deactivate(id);
    return { success: true, data };
  }

  @Post('accept-invite')
  @ApiOperation({ summary: 'Accept an invite and set an initial password (public)' })
  async acceptInvite(@Body() body: unknown) {
    const parsed = AcceptInviteSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.errors[0]?.message || 'Invalid request');
    return this.usersService.acceptInvite(parsed.data);
  }
}
