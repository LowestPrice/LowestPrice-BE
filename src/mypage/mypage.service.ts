import { Injectable } from '@nestjs/common';
import { MypageRepository } from './mypage.repository';
import { UpdateMypageDTO } from './dto/update.mypage.dto';
import * as AWS from 'aws-sdk';
import { extname } from 'path';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import {
  FileUploadException,
  NoUpdateProfileException,
  NotAuthorizedException,
} from 'src/common/exceptions/custom-exception';

@Injectable()
export class MypageService {
  private readonly s3: AWS.S3;
  constructor(private readonly mypageRepository: MypageRepository) {
    AWS.config.update({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      },
    });
    this.s3 = new AWS.S3();
  }

  //* 마이페이지 프로필 조회
  async getMypageProfile(userId: number) {
    const user = await this.mypageRepository.getMypageProfile(userId);

    // 사용자가 없을 경우 예외처리
    if (!user) {
      throw new NotAuthorizedException();
    }

    return user;
  }

  //! 파일 업로드 부분
  async uploadFile(file: Express.Multer.File): Promise<ManagedUpload.SendData> {
    console.log(`진입`);
    const foldername = 'profile-images/';
    const key = `${foldername}${Date.now()}${extname(file.originalname)}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      // ACL: 'public-read',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const uploadObject: ManagedUpload.SendData = await this.s3
        .upload(params)
        .promise();

      //const fileUrl = uploadObject.Location;

      return uploadObject;
    } catch (error) {
      // 파일 업로드시 에러 발생시 예외처리
      throw new FileUploadException();
    }
  }

  //* 마이페이지 프로필 업데이트
  async updateMypageProfile(
    userId: number,
    file: Express.Multer.File,
    data: UpdateMypageDTO
  ) {
    if(!file && (!data || !data.nickname && !data.image)) {
      throw new NoUpdateProfileException();
    }

    // 파일 업로드 사항 업데이트
    if (file) {
      const uploadObject = await this.uploadFile(file);
      data.image = (await uploadObject).Location;
    }
    const user = await this.mypageRepository.updateMypageProfile(userId, data);

    // 사용자가 없을 경우 에러처리
    if (!user) {
      throw new NotAuthorizedException();
    }

    return {
      success: 'success',
      status: 200,
      message: '프로필 업데이트에 성공했습니다.',
    };
  }
}
