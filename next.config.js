module.exports = {
  async redirects() {
    return [
      {
        source: '/signin/kakao',
        destination: '/api/auth/kakao',
        permanent: true,
      },
    ];
  },
};
