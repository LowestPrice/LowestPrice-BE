// scrapping 폴더에서만 사용하는 util 이기 떄문에 이 폴더에 별도로 설정

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
