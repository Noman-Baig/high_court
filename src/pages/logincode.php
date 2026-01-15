// <?php

// namespace App\Http\Controllers\Api\Authentication;

// use App\Http\Controllers\Controller;
// use App\Mail\Auth\LoginOtpMail;
// use App\Models\Otp;
// use App\Models\User;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Facades\Mail;
// use Illuminate\Support\Facades\Validator;


// class LoginController extends Controller
// {
//     public function login(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'cnic'    => 'required|string', 
//             'password' => 'required|string',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'status' => 'error',
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         $user = User::where('cnic', $request->cnic)
//             ->first();

//         if (!$user || !Hash::check($request->password, $user->password)) {
//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'Invalid credentials.'
//             ], 401);
//         }

//         if (!$user->email_verified) {
//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'Please verify your email first.',
//                 "email"=>$user->email
//             ], 403);
//         }

//         Otp::where('user_id', $user->id)
//             ->where('type', 'login')
//             ->whereNull('used_at')
//             ->update(['used_at' => now()]);

//         $otpCode = rand(100000, 999999);

//         Otp::create([
//             'user_id'    => $user->id,
//             'identifier' => $user->email,
//             'otp'        => Hash::make($otpCode),
//             'type'       => 'login',
//             'expires_at' => now()->addMinutes(5),
//         ]);

//          Mail::to($user->email)
//         ->queue( new LoginOtpMail($otpCode, $user->name));

//         return response()->json([
//             'status'  => 'success',
//             'message' => 'OTP sent. Please verify to continue login.',
//             "email"   => $user->email,
//             "otp"=>$otpCode
//         ], 200);
//     }
//     public function sendotp(Request $request)
//     {
//     $validator = Validator::make($request->all(), [
//         'email' => 'required|email|exists:users,email',
//     ]);

//     if ($validator->fails()) {
//         return response()->json([
//             'status' => 'error',
//             'errors' => $validator->errors()
//         ], 422);
//     }

//     $user = User::where('email', $request->email)->first();
//     if (!$user->email_verified) {
//         return response()->json([
//             'status' => 'error',
//             'message' => 'Email not verified.'
//         ], 403);
//     }
//     $recentOtp = Otp::where('user_id', $user->id)
//         ->where('type', "login")
//         ->where('created_at', '>=', now()->subMinutes(5))
//         ->whereNull('used_at')
//         ->first();

//     if ($recentOtp) {
//         return response()->json([
//             'status' => 'error',
//             'message' => 'OTP already sent. Please wait 5 minutes.'
//         ], 429);
//     }

//     Otp::where('user_id', $user->id)
//         ->where('type', "login")
//         ->whereNull('used_at')
//         ->update(['used_at' => now()]);

//     $otpCode = rand(100000, 999999);

//     Otp::create([
//         'user_id'    => $user->id,
//         'identifier' => $user->email,
//         'otp'        => Hash::make($otpCode),
//         'type'       => "login",
//         'expires_at' => now()->addMinutes(5),
//     ]);

//      Mail::to($user->email)
//         ->queue( new LoginOtpMail($otpCode, $user->name));

//     return response()->json([
//         'status' => 'success',
//         'message' => 'OTP resent successfully.',
//         "otp"=>$otpCode
//     ], 200);
//     }

//     public function verifyotp(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'email' => 'required|email|exists:users,email',
//             'otp'   => 'required|digits:6',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'status' => 'error',
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         $user = User::with('committees')->where('email', $request->email)->first();
//         $otp = Otp::where('user_id', $user->id)
//             ->where('type', 'login')
//             ->whereNull('used_at')
//             ->latest()
//             ->first();
      
//         if (!$otp || !Hash::check($request->otp, $otp->otp)) {
//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'Invalid OTP.'
//             ], 400);
//         }

//         if (now()->greaterThan($otp->expires_at)) {
//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'OTP has expired.'
//             ], 400);
//         }

//         $otp->update(['used_at' => now()]);
//         $chairmanCommittees = $user->committees
//         ->filter(fn ($committee) => $committee->pivot->role === 'chairman')
//         ->pluck('id','name')
//         ->values();

//         $isChairman = $chairmanCommittees->isNotEmpty();
        
        
//         $userArray = $user->toArray();
//         $userArray['is_chairman']     = $isChairman;
//         $userArray['committee_names'] = $chairmanCommittees;

//         $token = $user->createToken('login_token')->plainTextToken;
        
        

//         return response()->json([
//             'status' => 'success',
//             'message' => 'Login successful.',
//             'token' => $token,
//             // 'user' => $user,
//             'user' => $userArray
//             // 'is_chairman' => $isChairman,
//             // 'committee' => $chairmanCommittees
//         ], 200);
//     }

// }