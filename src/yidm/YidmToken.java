import java.security.MessageDigest;

public class YidmToken {

    private static final String salt = "yidmcom!@%^$$&**";
    private static final long oneDay = 86400000L;

    public static String md5(String key) {
        char[] hex = {
                '0', '1', '2', '3', '4', '5', '6', '7',
                '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
        };
        try {
            MessageDigest mdInst = MessageDigest.getInstance("MD5");
            mdInst.update(key.getBytes());
            byte[] ret = mdInst.digest();
            char[] str = new char[ret.length << 1];
            int k = 0;
            for (byte ii : ret) {
                str[k ++] = hex[(ii >>> 4) & 15];
                str[k ++] = hex[ii & 15];
            }
            return new String(str);
        } catch (Exception e) {
            return null;
        }
    }

    public static long getZeroPoint(long time) {
        return time - (time + 28800000) % oneDay;
    }

    public static long getZeroPointToday() {
        return getZeroPoint(System.currentTimeMillis());
    }

    private static String calcSecondPart(long zeroPoint) {
        return Long.toString(Math.round((float) (zeroPoint / 1000)));
    }

    private static String getTimeStamp(long time) {
        return calcSecondPart(getZeroPoint(time));
    }

    private static String getTimeStampToday() {
        return calcSecondPart(getZeroPointToday());
    }

    public static String todayAppToken(String deviceId) {
        return deviceId + "." + md5(md5(deviceId + getTimeStampToday() + salt));
    }

    public static String calcAppToken(String deviceId, long time) {
        return deviceId + "." + md5(md5(deviceId + getTimeStamp(time) + salt));
    }
}