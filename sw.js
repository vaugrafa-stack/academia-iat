// Gerado por tools/build-sw.mjs. Não editar manualmente.
'use strict';

const APP_ID = "academia-iat";
const VERSAO = "3a10b1b5d7e75ad5";
const BASE = "/academia-iat/";
const CACHE_PREFIX = "academia-iat:academia-iat:";
const CACHE_NUCLEO_PREFIX = CACHE_PREFIX + 'core:';
const CACHE_NUCLEO = CACHE_NUCLEO_PREFIX + VERSAO;
const CACHE_MIDIA = "academia-iat:academia-iat:media:v1";
const PRECACHE = ["/academia-iat/","/academia-iat/index.html","/academia-iat/assets/ContaLinkPage-ZU0hwmhU.js","/academia-iat/assets/ContaRemotaCard-CbOfEXZy.js","/academia-iat/assets/Flowcharts-BRvpJ2K8.js","/academia-iat/assets/NormativeAuthorityAxes-Bnx2riQZ.js","/academia-iat/assets/OfflineManager-BxEEFvDv.js","/academia-iat/assets/audiovisual-pilot-media-Bwvqm0fz.json","/academia-iat/assets/aula-media-IvKT2Zhz.json","/academia-iat/assets/avaliacoes-Cf2DNj2m.js","/academia-iat/assets/biblioteca-CcJejM_A.js","/academia-iat/assets/busca-DNaP1tSd.js","/academia-iat/assets/contaLinks-Dgkkg9IB.js","/academia-iat/assets/contaRemota-DA8obfHm.js","/academia-iat/assets/courseData-DVD_px4V.js","/academia-iat/assets/derivados-D1FHBkhX.js","/academia-iat/assets/empreendedor-CLFjWCQi.css","/academia-iat/assets/empreendedor-pWreg_A5.js","/academia-iat/assets/flowcharts-content-DpdkJ10M.json","/academia-iat/assets/formacao-Dv78G6T0.js","/academia-iat/assets/hydro-DFssx5tY.js","/academia-iat/assets/hydro-FWh7eV5F.css","/academia-iat/assets/index-lkd1Lgvw.js","/academia-iat/assets/lab-answer-reasons-Bqs3vCdC.json","/academia-iat/assets/lab-corpos-_lOfQtj2.json","/academia-iat/assets/lab-index-DUhpvRJY.json","/academia-iat/assets/labSourceIndex-BfnU0tW4.js","/academia-iat/assets/laboratorio-DGXY20rL.js","/academia-iat/assets/lessonEvidence-C6sYkkHn.js","/academia-iat/assets/lessonObjective-AaBFQqik.css","/academia-iat/assets/lessonObjective-wOW6EwI2.js","/academia-iat/assets/licao-CDZnPccd.js","/academia-iat/assets/main-8xFEWUP-.css","/academia-iat/assets/main-BhrEdE23.js","/academia-iat/assets/mapa-BGV0wHmJ.js","/academia-iat/assets/mapa-DVyiNd1Y.css","/academia-iat/assets/mapa-parana-CVApcY-G.json","/academia-iat/assets/mobileNavigation-BTBq_l4G.css","/academia-iat/assets/officialSources-DCiMlbJV.js","/academia-iat/assets/offline-CXgJijdG.js","/academia-iat/assets/offline-packages-isCyBIiy.json","/academia-iat/assets/painelAluno-CTZ25qMR.js","/academia-iat/assets/perfil-DsA0wIaB.js","/academia-iat/assets/pop-public-content-Djgkw6iu.json","/academia-iat/assets/preload-helper-CgXSye3D.js","/academia-iat/assets/profile-DXVeihcA.js","/academia-iat/assets/question-bank-De-XmBzg.json","/academia-iat/assets/redator-CnIvMqbI.js","/academia-iat/assets/redator-DnxgXve-.css","/academia-iat/assets/redatorIT-CV_zjfVr.js","/academia-iat/assets/rolldown-runtime-CbXtAM7H.js","/academia-iat/assets/routeStyles-DYax5qqB.css","/academia-iat/assets/sincroniaAutomatica-BBQWFIyU.js","/academia-iat/assets/startupDataRequests-BhMNVW2Y.js","/academia-iat/assets/textoTermos-DmEuZmcG.js","/academia-iat/assets/ui-BTtsPSbl.js","/academia-iat/assets/useMediaQuery-k-tATqdc.js","/academia-iat/assets/vendor-icons-DOmMlzhV.js","/academia-iat/assets/vendor-react-D5GZs-v_.js","/academia-iat/manifest.webmanifest","/academia-iat/icone-192.png","/academia-iat/icone-512.png","/academia-iat/media/learning-stage/professor-sprite.webp","/academia-iat/media/learning-stage/thematic-atlas.webp"];
const REVISOES_MIDIA = {"hidro/reversivel-bath-county.jpg":"972c1e5ba23a824f","hidro/turbina-francis.jpg":"ef5c7ec22e6a1dae","hidro/turbina-kaplan.jpg":"5dc7e9bfa38cab75","hidro/turbina-pelton.jpg":"73f8987ccd5302c7","hidro/usina-corte-realista.webp":"d724808859a196f7","media/README.md":"16212e7241d07705","media/analista-licenciamento.png":"c80879c1c6028d69","media/aula/manifest.json":"d22b53d5c8399cac","media/aula/pop-section-001.jpg":"7dcb659d1737e8b9","media/aula/pop-section-001.mp4":"24cf74947587fc36","media/aula/pop-section-001.visemes.json":"c20532357b736ec0","media/aula/pop-section-001.vtt":"c77e41f615169f54","media/aula/pop-section-002.jpg":"12c9441816bc95db","media/aula/pop-section-002.mp4":"e4217acc7ac9067a","media/aula/pop-section-002.visemes.json":"3be7793eb5b43a08","media/aula/pop-section-002.vtt":"fbf1366c8d951fe6","media/aula/pop-section-003.jpg":"b2f2c7556e6ff634","media/aula/pop-section-003.mp4":"a6992dbc04297591","media/aula/pop-section-003.visemes.json":"48b8cad3b8852df6","media/aula/pop-section-003.vtt":"5871b80ad37bf328","media/aula/pop-section-004.jpg":"2b55d53a6f529969","media/aula/pop-section-004.mp4":"d9fe19f3b2cdc441","media/aula/pop-section-004.visemes.json":"bae14586f120ad1d","media/aula/pop-section-004.vtt":"35d1850f6f21abf9","media/aula/pop-section-005.jpg":"8f0ecee991fbe287","media/aula/pop-section-005.mp4":"eb7780137a7e6356","media/aula/pop-section-005.visemes.json":"9c80251b0dfa5a22","media/aula/pop-section-005.vtt":"9f3945360839b362","media/aula/pop-section-006.jpg":"0a17a2d470e27385","media/aula/pop-section-006.mp4":"3345df15a0d9d0da","media/aula/pop-section-006.visemes.json":"b03569772805329a","media/aula/pop-section-006.vtt":"70a3b630ec45cfe5","media/aula/pop-section-007.jpg":"7a9e5778977a33b3","media/aula/pop-section-007.mp4":"da2152f6df9238b2","media/aula/pop-section-007.visemes.json":"6a779b19e529e5c2","media/aula/pop-section-007.vtt":"53f4960c2d24c43f","media/aula/pop-section-008.jpg":"df082089012b0c3a","media/aula/pop-section-008.mp4":"878c086ad6226801","media/aula/pop-section-008.visemes.json":"4b7f29d3ffecf002","media/aula/pop-section-008.vtt":"841e1263e54621e4","media/aula/pop-section-009.jpg":"cc5b334ed6948e06","media/aula/pop-section-009.mp4":"675505ebd8e35eed","media/aula/pop-section-009.visemes.json":"b673af87c0bf9f8c","media/aula/pop-section-009.vtt":"148dd87bb4aed1ab","media/aula/pop-section-010.jpg":"d81c6efbf0b6c6e6","media/aula/pop-section-010.mp4":"323a86082cd90b41","media/aula/pop-section-010.visemes.json":"6a6d40d5fbb7bb6c","media/aula/pop-section-010.vtt":"e8a0bbb3f4198552","media/aula/pop-section-011.jpg":"5dab76e9c7101ad7","media/aula/pop-section-011.mp4":"b05555b590640584","media/aula/pop-section-011.visemes.json":"4b1ad537c7d74f06","media/aula/pop-section-011.vtt":"e47ad4c454c6c9a5","media/aula/pop-section-012.jpg":"69e7a4f78b7ecb49","media/aula/pop-section-012.mp4":"0a80ae61d051f1df","media/aula/pop-section-012.visemes.json":"1482a8661bc528f9","media/aula/pop-section-012.vtt":"fe372eee707f2c1c","media/aula/pop-section-013.jpg":"3bbe3c6c7a671d29","media/aula/pop-section-013.mp4":"1f33a37dc0465502","media/aula/pop-section-013.visemes.json":"1d54af9cf6292fc9","media/aula/pop-section-013.vtt":"d3371511f5f96b48","media/aula/pop-section-015.jpg":"8aa8fb2b396ca556","media/aula/pop-section-015.mp4":"c7b17357a16cf9de","media/aula/pop-section-015.visemes.json":"8bbaca2471a0d084","media/aula/pop-section-015.vtt":"a21fb05128875088","media/aula/pop-section-016.jpg":"afe91d34856dd93f","media/aula/pop-section-016.mp4":"569c1605120ba947","media/aula/pop-section-016.visemes.json":"6e3db1400c0482e9","media/aula/pop-section-016.vtt":"4e716ddcb0834c97","media/aula/pop-section-017.jpg":"ad0eaa77553fa0c2","media/aula/pop-section-017.mp4":"aca3b797901dda60","media/aula/pop-section-017.visemes.json":"65a308667b2a5d44","media/aula/pop-section-017.vtt":"6357bc323d9a39f7","media/aula/pop-section-018.jpg":"061d01f21373d5e7","media/aula/pop-section-018.mp4":"8fe054747bced803","media/aula/pop-section-018.visemes.json":"b2950e11ea019a4e","media/aula/pop-section-018.vtt":"2daabbcad6235ff5","media/aula/pop-section-019.jpg":"19c6039a8fe509e3","media/aula/pop-section-019.mp4":"47d91efdfda6c573","media/aula/pop-section-019.visemes.json":"9c875cd2969eae17","media/aula/pop-section-019.vtt":"f823f9e9c6aa8079","media/aula/pop-section-020.jpg":"93ccfc738747537f","media/aula/pop-section-020.mp4":"978145ffdfde4961","media/aula/pop-section-020.visemes.json":"2c3acaf162cee84f","media/aula/pop-section-020.vtt":"46074450e21311eb","media/aula/pop-section-021.jpg":"d85f50286e7a352b","media/aula/pop-section-021.mp4":"e9e1314d6a50dcbd","media/aula/pop-section-021.visemes.json":"868633c1118c55ec","media/aula/pop-section-021.vtt":"c6962c7b84b23dc0","media/aula/pop-section-022.jpg":"af0b68606bcd25a2","media/aula/pop-section-022.mp4":"2851e2a161788c27","media/aula/pop-section-022.visemes.json":"e560ac6d4e9af6d9","media/aula/pop-section-022.vtt":"7a09521dda26316b","media/aula/pop-section-023.jpg":"426efe3d9dc6bed6","media/aula/pop-section-023.mp4":"6e9a75116d520edf","media/aula/pop-section-023.visemes.json":"9b24ce9cdec2f563","media/aula/pop-section-023.vtt":"59e1ad2526becf1c","media/aula/pop-section-024.jpg":"28fa13d330515c2d","media/aula/pop-section-024.mp4":"6b6569d1ffdaa0f8","media/aula/pop-section-024.visemes.json":"1e1d044934bffcc3","media/aula/pop-section-024.vtt":"4dd29c34513e4d52","media/aula/pop-section-025.jpg":"85e2ae8386d811f9","media/aula/pop-section-025.mp4":"730045eba499ffd8","media/aula/pop-section-025.visemes.json":"3972ca9073f50d2d","media/aula/pop-section-025.vtt":"ac351798f8b0ee01","media/aula/pop-section-026.jpg":"e61d5cf7d5af047d","media/aula/pop-section-026.mp4":"6fd605b5c7abd944","media/aula/pop-section-026.visemes.json":"9ff9fe266bfd8e57","media/aula/pop-section-026.vtt":"fb3850dfc2b88a83","media/aula/pop-section-027.jpg":"2c2f3daf10f39bd4","media/aula/pop-section-027.mp4":"d7d347063704d8b7","media/aula/pop-section-027.visemes.json":"12400cad22209c42","media/aula/pop-section-027.vtt":"d11fe3134db7808a","media/aula/pop-section-028.jpg":"446da2c7a33877cb","media/aula/pop-section-028.mp4":"2386e2ed1bc703b0","media/aula/pop-section-028.visemes.json":"64933ba443b1c878","media/aula/pop-section-028.vtt":"070835764da5bead","media/aula/pop-section-029.jpg":"d0d358c790930d04","media/aula/pop-section-029.mp4":"3f9d653b9d7725bb","media/aula/pop-section-029.visemes.json":"d1b1c3685a5b9e69","media/aula/pop-section-029.vtt":"b6c6efb5d1ce9ee5","media/aula/pop-section-030.jpg":"899b8c3cf4108469","media/aula/pop-section-030.mp4":"9252ddad386f42b0","media/aula/pop-section-030.visemes.json":"ed3cfe4102a266fa","media/aula/pop-section-030.vtt":"c01b1c67a7b786c8","media/aula/pop-section-031.jpg":"f259b65e1423842d","media/aula/pop-section-031.mp4":"945b8ca18ab594a1","media/aula/pop-section-031.visemes.json":"2830c67fa79f27a2","media/aula/pop-section-031.vtt":"7a80dac3450a3498","media/aula/pop-section-032.jpg":"d54772958e27b78e","media/aula/pop-section-032.mp4":"8caa6f5eb8c11da2","media/aula/pop-section-032.visemes.json":"a95ca3d5a1d03e72","media/aula/pop-section-032.vtt":"811e92e4e51a3cff","media/aula/pop-section-033.jpg":"c477bef4f6cc6d91","media/aula/pop-section-033.mp4":"7ad6c9ce0590ddb2","media/aula/pop-section-033.visemes.json":"4c30b718e1a83c27","media/aula/pop-section-033.vtt":"22371dc1a23f2c07","media/aula/pop-section-034.jpg":"3ce8ed14fa89ab3d","media/aula/pop-section-034.mp4":"37c82ca51561bc27","media/aula/pop-section-034.visemes.json":"db4e30e060f9cbdf","media/aula/pop-section-034.vtt":"05406dd78ab8d38a","media/aula/pop-section-035.jpg":"ffe9eac7c27b574b","media/aula/pop-section-035.mp4":"f1befc620337ce04","media/aula/pop-section-035.visemes.json":"55f12b2e368430f3","media/aula/pop-section-035.vtt":"87cb53772a70b350","media/aula/pop-section-036.jpg":"e7d217842ebaab21","media/aula/pop-section-036.mp4":"5a8c7e71a6ed7c19","media/aula/pop-section-036.visemes.json":"e6c929f9066a8e2d","media/aula/pop-section-036.vtt":"b6cddf7127581a98","media/aula/pop-section-037.jpg":"18a65b48e9b95a43","media/aula/pop-section-037.mp4":"de230cd3f3b50f54","media/aula/pop-section-037.visemes.json":"14b19920c26d5e31","media/aula/pop-section-037.vtt":"639faada375a8def","media/aula/pop-section-038.jpg":"a89943ef2ed8be63","media/aula/pop-section-038.mp4":"61d061c954708e0a","media/aula/pop-section-038.visemes.json":"ef9845e381efcc68","media/aula/pop-section-038.vtt":"03b0704f02909bc8","media/aula/pop-section-039.jpg":"878da3b36e32f4f4","media/aula/pop-section-039.mp4":"3574dff9abf6a481","media/aula/pop-section-039.visemes.json":"c45b81cbfa5f907d","media/aula/pop-section-039.vtt":"0bed56137c8a9462","media/aula/pop-section-040.jpg":"43ad969c7b8fe2f0","media/aula/pop-section-040.mp4":"b9dd02c6a8926c2c","media/aula/pop-section-040.visemes.json":"12488983ed99eefb","media/aula/pop-section-040.vtt":"c0906608932ab688","media/aula/pop-section-041.jpg":"8834e6175f1e2b55","media/aula/pop-section-041.mp4":"5940b982ff0216f4","media/aula/pop-section-041.visemes.json":"cffce2f40517f5d7","media/aula/pop-section-041.vtt":"e682617c0d6cd608","media/aula/pop-section-042.jpg":"bf018f1b63beb879","media/aula/pop-section-042.mp4":"e9db1eb0ddd0b78f","media/aula/pop-section-042.visemes.json":"e3fcb6a7df5e0f80","media/aula/pop-section-042.vtt":"08d43f7f2abd89bd","media/aula/pop-section-043.jpg":"d4d31a435201e19d","media/aula/pop-section-043.mp4":"71d15493564460e7","media/aula/pop-section-043.visemes.json":"7c3d4dc7bdc641c0","media/aula/pop-section-043.vtt":"c64a893ff800ca23","media/aula/pop-section-045.jpg":"f44d196c48c461b6","media/aula/pop-section-045.mp4":"0b457c82035de04e","media/aula/pop-section-045.visemes.json":"1431ee28859c1e5d","media/aula/pop-section-045.vtt":"639b2336e16b31ee","media/aula/pop-section-046.jpg":"9593382e711a26bc","media/aula/pop-section-046.mp4":"b7dffbadede9d777","media/aula/pop-section-046.visemes.json":"fe8f0b16d2192c5a","media/aula/pop-section-046.vtt":"28358a3522ae8879","media/aula/pop-section-047.jpg":"e15af4c2662d4f44","media/aula/pop-section-047.mp4":"821a4101b05d8fdf","media/aula/pop-section-047.visemes.json":"75a72a2623fb316a","media/aula/pop-section-047.vtt":"89b7f36750d8120c","media/aula/pop-section-048.jpg":"1ce6a27cf47d450f","media/aula/pop-section-048.mp4":"19790c9166a03bf0","media/aula/pop-section-048.visemes.json":"5a0c4f0af9e45345","media/aula/pop-section-048.vtt":"d34b1d12adfd49ac","media/aula/pop-section-049.jpg":"54537d5ea2cde1fd","media/aula/pop-section-049.mp4":"d206fe22edecb0ed","media/aula/pop-section-049.visemes.json":"49a5b42fc3884782","media/aula/pop-section-049.vtt":"276d77aac7ced09d","media/aula/pop-section-050.jpg":"dd42d4d1ae1a095c","media/aula/pop-section-050.mp4":"1b21ae13ae41457d","media/aula/pop-section-050.visemes.json":"5df8813d9d65827b","media/aula/pop-section-050.vtt":"b3a7c0696cc8d762","media/aula/pop-section-051.jpg":"2fec406fcec91a0d","media/aula/pop-section-051.mp4":"0cfe84533751163b","media/aula/pop-section-051.visemes.json":"1620c33909ddfab5","media/aula/pop-section-051.vtt":"503528934864a7bc","media/aula/pop-section-052.jpg":"c0b1410e7b7ba0b5","media/aula/pop-section-052.mp4":"86e1e551ff765988","media/aula/pop-section-052.visemes.json":"79028383835fad0b","media/aula/pop-section-052.vtt":"2d535e1a9de9c27c","media/aula/pop-section-053.jpg":"1bc3ab88767d9cd8","media/aula/pop-section-053.mp4":"69c97b6ed86bff04","media/aula/pop-section-053.visemes.json":"7616507c8b044470","media/aula/pop-section-053.vtt":"6df4ef606ef871c9","media/aula/pop-section-054.jpg":"611e186ed6cc88ad","media/aula/pop-section-054.mp4":"d7cd779eb3d1f418","media/aula/pop-section-054.visemes.json":"be0668c7c756be97","media/aula/pop-section-054.vtt":"16ee60157741e237","media/aula/pop-section-055.jpg":"2c1140885d0d9bb6","media/aula/pop-section-055.mp4":"f52fea67c1f08c79","media/aula/pop-section-055.visemes.json":"3f299749d51538f5","media/aula/pop-section-055.vtt":"fbd71e2490b917dc","media/aula/pop-section-056.jpg":"aab0fbb66be68c98","media/aula/pop-section-056.mp4":"e2e5f6097ded85ab","media/aula/pop-section-056.visemes.json":"56dc37d1aee14df5","media/aula/pop-section-056.vtt":"26030847a02ac82c","media/aula/pop-section-057.jpg":"e8afff66d34cf8ce","media/aula/pop-section-057.mp4":"d745221fd05cf0d9","media/aula/pop-section-057.visemes.json":"c70592717d353df9","media/aula/pop-section-057.vtt":"e6011449556ae4dd","media/aula/pop-section-058.jpg":"f0eb18c70fa3a3cf","media/aula/pop-section-058.mp4":"182425c0dbc1d24e","media/aula/pop-section-058.visemes.json":"0f03a221d3fa83dd","media/aula/pop-section-058.vtt":"afe9bf3227e86399","media/aula/pop-section-059.jpg":"8237337a2cee2082","media/aula/pop-section-059.mp4":"953ac8c0d8714ec9","media/aula/pop-section-059.visemes.json":"de67f21165588e8d","media/aula/pop-section-059.vtt":"b09c6aacdcd08fbc","media/aula/pop-section-060.jpg":"b30e1cb3db3c24ef","media/aula/pop-section-060.mp4":"6a982e9f52172918","media/aula/pop-section-060.visemes.json":"8a4d95991cf0c924","media/aula/pop-section-060.vtt":"6d62e42ca11caeca","media/aula/pop-section-061.jpg":"907afac6738c820d","media/aula/pop-section-061.mp4":"faf1caf5554ec666","media/aula/pop-section-061.visemes.json":"4b4db4859e5701db","media/aula/pop-section-061.vtt":"a7c991fac409066d","media/aula/pop-section-062.jpg":"08c9001f0c7d2bb5","media/aula/pop-section-062.mp4":"cdaec4c501c807ce","media/aula/pop-section-062.visemes.json":"4c49bca27f3e5714","media/aula/pop-section-062.vtt":"437f07002df98a72","media/aula/pop-section-063.jpg":"c89796aabf81884a","media/aula/pop-section-063.mp4":"1a9b07bee32d029f","media/aula/pop-section-063.visemes.json":"883c4b1e6f20cbb7","media/aula/pop-section-063.vtt":"76229fb6518070de","media/aula/pop-section-064.jpg":"3c67125c86d0e667","media/aula/pop-section-064.mp4":"ccb5f88b598b8da4","media/aula/pop-section-064.visemes.json":"fad3588d2fc3c408","media/aula/pop-section-064.vtt":"d5656b2875f8e13d","media/aula/pop-section-065.jpg":"505055edd1ade4c3","media/aula/pop-section-065.mp4":"83ab20b1b877519a","media/aula/pop-section-065.visemes.json":"cdb79cbe8c6cd0f3","media/aula/pop-section-065.vtt":"3405b71601628872","media/aula/pop-section-066.jpg":"66579de4c9287e9c","media/aula/pop-section-066.mp4":"33c1523308ec346b","media/aula/pop-section-066.visemes.json":"ac1d00dd76c0ba94","media/aula/pop-section-066.vtt":"d339fbc52d38025f","media/aula/pop-section-067.jpg":"48ebc462ecaa390e","media/aula/pop-section-067.mp4":"00934e4d9557af3e","media/aula/pop-section-067.visemes.json":"09d25283f1efca96","media/aula/pop-section-067.vtt":"ee92308b4841afc8","media/aula/pop-section-068.jpg":"3aab1c503ea3fd95","media/aula/pop-section-068.mp4":"ea4133ec3a887688","media/aula/pop-section-068.visemes.json":"3dfb3b54e7ddc1b1","media/aula/pop-section-068.vtt":"98da2231c5b6d3ac","media/aula/pop-section-069.jpg":"ce41907a6657f553","media/aula/pop-section-069.mp4":"be5f34a425d47007","media/aula/pop-section-069.visemes.json":"0b9373bddaacdf4d","media/aula/pop-section-069.vtt":"8a0e9cab84fcd883","media/aula/pop-section-070.jpg":"5684a71dbd3260fa","media/aula/pop-section-070.mp4":"8e85bb1b3501006a","media/aula/pop-section-070.visemes.json":"dc9969393ec3f2d1","media/aula/pop-section-070.vtt":"ba4b0c4a76e7c183","media/aula/pop-section-071.jpg":"159bb55663a6381d","media/aula/pop-section-071.mp4":"b433caa7ca8f427b","media/aula/pop-section-071.visemes.json":"f3792134e90c86f8","media/aula/pop-section-071.vtt":"cb4404532454bd4a","media/aula/pop-section-072.jpg":"f5ef591e5ebf1cb3","media/aula/pop-section-072.mp4":"a6919322f695410b","media/aula/pop-section-072.visemes.json":"0d0a14faea989463","media/aula/pop-section-072.vtt":"6fc5a6a6b43b3976","media/aula/pop-section-073.jpg":"bcaa589379cdd9c4","media/aula/pop-section-073.mp4":"885e47b1d5a7c1ac","media/aula/pop-section-073.visemes.json":"aa285faf0e25ace6","media/aula/pop-section-073.vtt":"458dee4f5099d1d8","media/aula/pop-section-074.jpg":"08ddbd362600bc11","media/aula/pop-section-074.mp4":"ef26310ea7638a29","media/aula/pop-section-074.visemes.json":"bf4a4e8a9b4ae909","media/aula/pop-section-074.vtt":"9e5dd5e5d3aef68d","media/aula/pop-section-075.jpg":"e2d9923719354b13","media/aula/pop-section-075.mp4":"fa571b37fe77e732","media/aula/pop-section-075.visemes.json":"65c1a79a33ab5e59","media/aula/pop-section-075.vtt":"34407f54b570b132","media/aula/pop-section-076.jpg":"f38561e78763d036","media/aula/pop-section-076.mp4":"431e5a2140583456","media/aula/pop-section-076.visemes.json":"dc54e2315c80ca12","media/aula/pop-section-076.vtt":"20f2529d59704d6f","media/aula/pop-section-078.jpg":"68f09517d4c0bc08","media/aula/pop-section-078.mp4":"f53ae8d85b6fa7cc","media/aula/pop-section-078.visemes.json":"26f5083a8b93876a","media/aula/pop-section-078.vtt":"11674ce24e356c00","media/aula/pop-section-079.jpg":"bf221a41785d447e","media/aula/pop-section-079.mp4":"5e3973a9eaf79c73","media/aula/pop-section-079.visemes.json":"c8fe7d5f8f11faa1","media/aula/pop-section-079.vtt":"3e33f41cf07d59c9","media/aula/pop-section-080.jpg":"d2653c59bdf2c4bc","media/aula/pop-section-080.mp4":"d514c2d9aa17953c","media/aula/pop-section-080.visemes.json":"e0b16b08b06eded6","media/aula/pop-section-080.vtt":"6d5d22daa2c4d3ec","media/aula/pop-section-081.jpg":"5a9ace97f1a187d1","media/aula/pop-section-081.mp4":"e33f9dd59f84af5d","media/aula/pop-section-081.visemes.json":"080379d4f80634c8","media/aula/pop-section-081.vtt":"73252f4c11d93749","media/aula/pop-section-082.jpg":"c26864260bcafb69","media/aula/pop-section-082.mp4":"804a87ee7d8aabe8","media/aula/pop-section-082.visemes.json":"a1463629f27a4905","media/aula/pop-section-082.vtt":"b18a12bb59bba3d5","media/aula/pop-section-083.jpg":"9845bbc39cac5b41","media/aula/pop-section-083.mp4":"8364a5bc3f28abde","media/aula/pop-section-083.visemes.json":"ce288ee14d4be092","media/aula/pop-section-083.vtt":"c6345bf873db1576","media/aula/pop-section-084.jpg":"3554def14257f45b","media/aula/pop-section-084.mp4":"3474892c299eda63","media/aula/pop-section-084.visemes.json":"c7877865e1e8bc65","media/aula/pop-section-084.vtt":"67ff209eebd17619","media/aula/pop-section-085.jpg":"08bde239b1fda0e9","media/aula/pop-section-085.mp4":"1a8898638848d25e","media/aula/pop-section-085.visemes.json":"412b72e415762cf7","media/aula/pop-section-085.vtt":"0bf6533984beba3c","media/aula/pop-section-086.jpg":"2f8825dc521e6c6b","media/aula/pop-section-086.mp4":"7fef18c4a9550396","media/aula/pop-section-086.visemes.json":"45b98c3328ec9af4","media/aula/pop-section-086.vtt":"9ba576bf89267c5f","media/aula/pop-section-087.jpg":"5776c4b4b8ef4b8c","media/aula/pop-section-087.mp4":"0a0593840e30a4ab","media/aula/pop-section-087.visemes.json":"4dfad58b1f09f58f","media/aula/pop-section-087.vtt":"59fc30ad8a85dcf8","media/aula/pop-section-088.jpg":"a6112905828f74bf","media/aula/pop-section-088.mp4":"2d794a9cb5842084","media/aula/pop-section-088.visemes.json":"9ccae7157f47037d","media/aula/pop-section-088.vtt":"01adb769503b5ceb","media/aula/pop-section-089.jpg":"4ca2377f43122d86","media/aula/pop-section-089.mp4":"0cd89bbaeacf98af","media/aula/pop-section-089.visemes.json":"1014c2880e2c1c92","media/aula/pop-section-089.vtt":"6a8e77f22664ea1e","media/aula/pop-section-090.jpg":"70cf13ea481acfcb","media/aula/pop-section-090.mp4":"cc5c17124bb408c2","media/aula/pop-section-090.visemes.json":"546fc81419b13505","media/aula/pop-section-090.vtt":"a390be2038fbab9d","media/aula/pop-section-091.jpg":"4e64aaa8e1495196","media/aula/pop-section-091.mp4":"83d3392ab445d63e","media/aula/pop-section-091.visemes.json":"d66737d617361be6","media/aula/pop-section-091.vtt":"d01ce6f7736eeec9","media/aula/pop-section-092.jpg":"5471df7cbc0dcaa2","media/aula/pop-section-092.mp4":"154d3e5aa0e81c58","media/aula/pop-section-092.visemes.json":"2daabe8470e58988","media/aula/pop-section-092.vtt":"f4bcc67b4bc55d0a","media/aula/pop-section-093.jpg":"a590b70adf7be956","media/aula/pop-section-093.mp4":"f7f141809b0be958","media/aula/pop-section-093.visemes.json":"a154c480666a26e6","media/aula/pop-section-093.vtt":"7bc7ff9ddec54dcd","media/aula/pop-section-094.jpg":"611d32458525ca78","media/aula/pop-section-094.mp4":"26f9d76b8dbc83d0","media/aula/pop-section-094.visemes.json":"7ba26d3c740c6e94","media/aula/pop-section-094.vtt":"cf98820efecc6ccc","media/aula/pop-section-095.jpg":"fe809ad454f57d7d","media/aula/pop-section-095.mp4":"68710b9a31cc0e3a","media/aula/pop-section-095.visemes.json":"a1ea001b41b6a0bd","media/aula/pop-section-095.vtt":"dfa53c9cc15a7123","media/aula/pop-section-096.jpg":"c87d491f1843ae23","media/aula/pop-section-096.mp4":"530280ead5e66c32","media/aula/pop-section-096.visemes.json":"1f344e3ada9a7181","media/aula/pop-section-096.vtt":"58d9aaa5cde61103","media/aula/pop-section-097.jpg":"12bc2dad12d867d4","media/aula/pop-section-097.mp4":"4b0c9fde0973d166","media/aula/pop-section-097.visemes.json":"eefbf87a87a5d6c4","media/aula/pop-section-097.vtt":"6fd5cdf816de05ee","media/aula/pop-section-098.jpg":"95799c998ad318aa","media/aula/pop-section-098.mp4":"5f6f7ce6b4534f3a","media/aula/pop-section-098.visemes.json":"2fef3a751024037e","media/aula/pop-section-098.vtt":"f4fb313ecc15d90e","media/aula/pop-section-099.jpg":"b92a1595b7b74d2f","media/aula/pop-section-099.mp4":"33499c7f8df59e45","media/aula/pop-section-099.visemes.json":"56f8f4a7c1bbb1cc","media/aula/pop-section-099.vtt":"8f6541c5ba0d4148","media/aula/pop-section-100.jpg":"dd6b224ff8aa247b","media/aula/pop-section-100.mp4":"8fe81efac21f774f","media/aula/pop-section-100.visemes.json":"3ac241b7c29ded51","media/aula/pop-section-100.vtt":"d0b4b5d89e32fd94","media/aula/pop-section-101.jpg":"8cc5c4f244848ace","media/aula/pop-section-101.mp4":"861a6692b3819379","media/aula/pop-section-101.visemes.json":"a260a44674692d48","media/aula/pop-section-101.vtt":"451b48eaf70c67d8","media/aula/pop-section-102.jpg":"d86764ea750a02c2","media/aula/pop-section-102.mp4":"f8b5afd663f98594","media/aula/pop-section-102.visemes.json":"a6a9d6e918d8af4a","media/aula/pop-section-102.vtt":"1a00617e2271fd0e","media/aula/pop-section-103.jpg":"79c57b2d90dd7cb3","media/aula/pop-section-103.mp4":"e3a3801cd5c9e602","media/aula/pop-section-103.visemes.json":"c8ad6ccc4e7189c3","media/aula/pop-section-103.vtt":"593031683cf4ede3","media/aula/pop-section-104.jpg":"8b7d773712953efb","media/aula/pop-section-104.mp4":"c6134f3ffe5b2ddf","media/aula/pop-section-104.visemes.json":"55316222b5be5312","media/aula/pop-section-104.vtt":"abc6ef383756e6a9","media/aula/pop-section-105.jpg":"cbea3e9d6353d1fb","media/aula/pop-section-105.mp4":"9c595b428afc44df","media/aula/pop-section-105.visemes.json":"fbc7fc19a3141a61","media/aula/pop-section-105.vtt":"dfcd2151134f7c6e","media/aula/pop-section-106.jpg":"023ed240309fb299","media/aula/pop-section-106.mp4":"b6be27ddbe2dcab0","media/aula/pop-section-106.visemes.json":"0458bd8975babec0","media/aula/pop-section-106.vtt":"673b15b88652c282","media/aula/pop-section-107.jpg":"c94892ac67ba900f","media/aula/pop-section-107.mp4":"f244d71b1930cac6","media/aula/pop-section-107.visemes.json":"14731702082317b6","media/aula/pop-section-107.vtt":"946b6ab0c94d37cb","media/aula/pop-section-108.jpg":"d5e6f5f5357b8016","media/aula/pop-section-108.mp4":"517936c2ef0d9557","media/aula/pop-section-108.visemes.json":"f4a529991036d6a2","media/aula/pop-section-108.vtt":"dc6d923133061415","media/aula/pop-section-109.jpg":"2e4548f3c719d414","media/aula/pop-section-109.mp4":"3365e05198f01411","media/aula/pop-section-109.visemes.json":"2a6d3ebcf809dbc8","media/aula/pop-section-109.vtt":"2d4fc6f600517e30","media/aula/pop-section-110.jpg":"7fa5be7d8428c7e8","media/aula/pop-section-110.mp4":"9ffc237cd4f53ddb","media/aula/pop-section-110.visemes.json":"eb470393e20f602e","media/aula/pop-section-110.vtt":"9f42d63599412504","media/aula/pop-section-111.jpg":"9b168dd165b05c46","media/aula/pop-section-111.mp4":"0a8b21d7aa23e880","media/aula/pop-section-111.visemes.json":"8c9b1dc0aa234417","media/aula/pop-section-111.vtt":"4e269726bee95c29","media/aula/pop-section-112.jpg":"a99122a10518561d","media/aula/pop-section-112.mp4":"585f357e75368b54","media/aula/pop-section-112.visemes.json":"e0451dd08141ab1f","media/aula/pop-section-112.vtt":"e77f697273695095","media/aula/pop-section-113.jpg":"5de351f83bb1188f","media/aula/pop-section-113.mp4":"7dceabb951a1f0d7","media/aula/pop-section-113.visemes.json":"fc500cdd8e8e9301","media/aula/pop-section-113.vtt":"d3fdc52e278c54d2","media/aula/pop-section-114.jpg":"2156da99142ea6c1","media/aula/pop-section-114.mp4":"49804431d28d9846","media/aula/pop-section-114.visemes.json":"d2c33aee6a469efd","media/aula/pop-section-114.vtt":"e129b37470c1ea5d","media/aula/pop-section-115.jpg":"92ab139515c884f0","media/aula/pop-section-115.mp4":"de8bbd49457f0ce2","media/aula/pop-section-115.visemes.json":"1c68c42708453d6d","media/aula/pop-section-115.vtt":"22424b27c34bee3c","media/aula/pop-section-116.jpg":"8f8d79d8c566c2ad","media/aula/pop-section-116.mp4":"f70522b0a21c0fb9","media/aula/pop-section-116.visemes.json":"8833380b86aec9b3","media/aula/pop-section-116.vtt":"f8461c77368af143","media/aula/pop-section-117.jpg":"4477765405f67549","media/aula/pop-section-117.mp4":"3189e0878ff184c5","media/aula/pop-section-117.visemes.json":"ba21316324a91aeb","media/aula/pop-section-117.vtt":"03619dcf88ac5fda","media/aula/pop-section-118.jpg":"5cb181dd4a74acce","media/aula/pop-section-118.mp4":"3304d52579d84d8f","media/aula/pop-section-118.visemes.json":"04f2fe55fc00b21b","media/aula/pop-section-118.vtt":"8f6a0178d581dc9f","media/aula/pop-section-119.jpg":"4dec545c931a0238","media/aula/pop-section-119.mp4":"610fd264fabebef6","media/aula/pop-section-119.visemes.json":"6513f31220c59f45","media/aula/pop-section-119.vtt":"951cfb5f839347a6","media/aula/pop-section-120.jpg":"363a9378e854beda","media/aula/pop-section-120.mp4":"71c5510eff652e49","media/aula/pop-section-120.visemes.json":"a22b3a0711da0998","media/aula/pop-section-120.vtt":"4321c36625509036","media/aula/pop-section-121.jpg":"eb48a3e8488e8095","media/aula/pop-section-121.mp4":"241cb3818c5a5535","media/aula/pop-section-121.visemes.json":"f0e7ae531126c187","media/aula/pop-section-121.vtt":"e8b31e9f1c0ed3b8","media/aula/pop-section-122.jpg":"d487f49ca5c0de98","media/aula/pop-section-122.mp4":"1a1c4d89f580de1f","media/aula/pop-section-122.visemes.json":"d3a5db51f20a26ab","media/aula/pop-section-122.vtt":"e7b71794e46fff27","media/aula/pop-section-123.jpg":"6ac1954382c0d24a","media/aula/pop-section-123.mp4":"c1e24e448e1f9a2f","media/aula/pop-section-123.visemes.json":"deacac270b9f783e","media/aula/pop-section-123.vtt":"df3649ba4bf2429a","media/aula/pop-section-124.jpg":"643747fb7bc9ef8a","media/aula/pop-section-124.mp4":"c2ba58215f0efb18","media/aula/pop-section-124.visemes.json":"3dc12ad535b0c233","media/aula/pop-section-124.vtt":"eaaf23703b4bca68","media/aula/pop-section-125.jpg":"bbdae41cfa3124b4","media/aula/pop-section-125.mp4":"af6465cbc739ee23","media/aula/pop-section-125.visemes.json":"7e918cdfbe8650e2","media/aula/pop-section-125.vtt":"0e359860e5822379","media/aula/pop-section-132.jpg":"3d68ad2e4c46c5da","media/aula/pop-section-132.mp4":"cb50a90602167d35","media/aula/pop-section-132.visemes.json":"2379030a9e1cf26e","media/aula/pop-section-132.vtt":"bde1e0ab4962cece","media/aula/pop-section-133.jpg":"d4be53599091ddd1","media/aula/pop-section-133.mp4":"2b88e60762548cc6","media/aula/pop-section-133.visemes.json":"2c6e665b968aa0d0","media/aula/pop-section-133.vtt":"2919663be92c45c7","media/aula/pop-section-134.jpg":"172d84d133c2334a","media/aula/pop-section-134.mp4":"3ccd7d600c78f830","media/aula/pop-section-134.visemes.json":"089ef67a5c4dd3a5","media/aula/pop-section-134.vtt":"ac447b98fcfc7256","media/aula/pop-section-135.jpg":"abaaf88ba6240692","media/aula/pop-section-135.mp4":"49b199554d071a6f","media/aula/pop-section-135.visemes.json":"3f364d71d3d5998c","media/aula/pop-section-135.vtt":"0d5f993da064ac87","media/aula/pop-section-136.jpg":"f591632c93edbf10","media/aula/pop-section-136.mp4":"cc12fef7efc745f0","media/aula/pop-section-136.visemes.json":"52153200dae88b26","media/aula/pop-section-136.vtt":"eba95e668190752f","media/aula/pop-section-137.jpg":"c9ae8f08b3a3ab80","media/aula/pop-section-137.mp4":"6bc1aab1f9605fcb","media/aula/pop-section-137.visemes.json":"3262a375d0ffc561","media/aula/pop-section-137.vtt":"638f82329c73b106","media/aula/pop-section-138.jpg":"44a6638bd869dc17","media/aula/pop-section-138.mp4":"5379c5f119688b15","media/aula/pop-section-138.visemes.json":"06a2ae202fa2b6b7","media/aula/pop-section-138.vtt":"cb6303e50ea4202d","media/aula/pop-section-139.jpg":"30876453fcddf47d","media/aula/pop-section-139.mp4":"8693a9245fcce93b","media/aula/pop-section-139.visemes.json":"6445093d52f4a61e","media/aula/pop-section-139.vtt":"63957cd0dc1c1ee1","media/aula/pop-section-140.jpg":"b9f8c49fffeaddc9","media/aula/pop-section-140.mp4":"7df85707b0a0022d","media/aula/pop-section-140.visemes.json":"1d299ef5747c1196","media/aula/pop-section-140.vtt":"9483b69b58299c63","media/aula/pop-section-141.jpg":"157e06a6bade09c3","media/aula/pop-section-141.mp4":"74f1499c1190210c","media/aula/pop-section-141.visemes.json":"404bd87f074d33a4","media/aula/pop-section-141.vtt":"e3dbbcc956a1ffaa","media/aula/pop-section-142.jpg":"616d01d4445fa476","media/aula/pop-section-142.mp4":"2ddc5ad7d0378236","media/aula/pop-section-142.visemes.json":"5eeca9c35d13469f","media/aula/pop-section-142.vtt":"d7a390ce01309ba3","media/aula/pop-section-143.jpg":"11ed70c59a62ad5e","media/aula/pop-section-143.mp4":"9a9362d9f65f93a5","media/aula/pop-section-143.visemes.json":"398a43b07bda0bc7","media/aula/pop-section-143.vtt":"dd8aa8ca62df774f","media/aula/pop-section-144.jpg":"c23a96431c562b5e","media/aula/pop-section-144.mp4":"ccf4f7d6ba1221cc","media/aula/pop-section-144.visemes.json":"af008d2dd35229f9","media/aula/pop-section-144.vtt":"57196a37f26c2be3","media/aula/pop-section-145.jpg":"69101d9edf789349","media/aula/pop-section-145.mp4":"110b1101f9e9dcc2","media/aula/pop-section-145.visemes.json":"2cd3f696d7c8829b","media/aula/pop-section-145.vtt":"8aec3e641c8812ad","media/aula/pop-section-146.jpg":"d78bc946ac037f80","media/aula/pop-section-146.mp4":"cd395fb68923f7f5","media/aula/pop-section-146.visemes.json":"78f861b0974f588c","media/aula/pop-section-146.vtt":"5e57e38593914c5f","media/aula/pop-section-147.jpg":"ce92598ac3b7e08a","media/aula/pop-section-147.mp4":"ba08f4e1c8830b08","media/aula/pop-section-147.visemes.json":"87836596fc8544a7","media/aula/pop-section-147.vtt":"32e950906698bbfd","media/aula/pop-section-148.jpg":"d994affdae1d02d6","media/aula/pop-section-148.mp4":"bd0f34d7219f88ef","media/aula/pop-section-148.visemes.json":"793d1226b5bbf018","media/aula/pop-section-148.vtt":"1f8719c3f9a5463c","media/aula/pop-section-149.jpg":"9627da3ec5152a34","media/aula/pop-section-149.mp4":"c4d7d86699e116dc","media/aula/pop-section-149.visemes.json":"d9dae88f5cab8736","media/aula/pop-section-149.vtt":"689fe8cd9532be5e","media/aula/pop-section-150.jpg":"c95e077b8fd87b35","media/aula/pop-section-150.mp4":"c93be5451ce5d141","media/aula/pop-section-150.visemes.json":"764dc8dd6e5fa12c","media/aula/pop-section-150.vtt":"0569c5c7df615563","media/aula/pop-section-151.jpg":"e247d6deabe135bd","media/aula/pop-section-151.mp4":"0dab2f6ae5af7be2","media/aula/pop-section-151.visemes.json":"d0b2a115143bc63d","media/aula/pop-section-151.vtt":"6ed9419454978991","media/aula/pop-section-152.jpg":"eb1df2fda36ca2d5","media/aula/pop-section-152.mp4":"278c930ac779a078","media/aula/pop-section-152.visemes.json":"e508314c0f8eb21d","media/aula/pop-section-152.vtt":"9f77b61754ce74c0","media/aula/pop-section-153.jpg":"8a70c7eb4170937b","media/aula/pop-section-153.mp4":"2effd36d9eee1df2","media/aula/pop-section-153.visemes.json":"8542364e7054ec74","media/aula/pop-section-153.vtt":"f48f42f2d4e6ab10","media/aula/pop-section-154.jpg":"1a67eb63d19e0efa","media/aula/pop-section-154.mp4":"f82e299a87d09740","media/aula/pop-section-154.visemes.json":"36592960662b423f","media/aula/pop-section-154.vtt":"08daef595354b3f1","media/aula/pop-section-155.jpg":"aa35650713ae472f","media/aula/pop-section-155.mp4":"32b10163ec4bebae","media/aula/pop-section-155.visemes.json":"9e0c5efe82a61415","media/aula/pop-section-155.vtt":"99c1db51455f05e8","media/aula/pop-section-156.jpg":"dbf152a9ebbbdda2","media/aula/pop-section-156.mp4":"e3eb90bcfaf95b62","media/aula/pop-section-156.visemes.json":"7a9d1b754df512d6","media/aula/pop-section-156.vtt":"b6fcb2dc480a2c37","media/aula/pop-section-157.jpg":"0d430c10a9747775","media/aula/pop-section-157.mp4":"2ec1b1a56655b25c","media/aula/pop-section-157.visemes.json":"67994abd6c6397a3","media/aula/pop-section-157.vtt":"b81cdaedf5ce9d67","media/aula/pop-section-158.jpg":"0f3ca4dd08ae71e8","media/aula/pop-section-158.mp4":"5185647d4ec3d329","media/aula/pop-section-158.visemes.json":"002fcea6f7fa03cc","media/aula/pop-section-158.vtt":"8ba8a6b96f094bc0","media/aula/pop-section-159.jpg":"e1bb9444ead833cc","media/aula/pop-section-159.mp4":"a1f35cf632741146","media/aula/pop-section-159.visemes.json":"482d5f7cebdadaac","media/aula/pop-section-159.vtt":"17b9c0c5b885ab26","media/aula/pop-section-160.jpg":"b2b3466c5c1785a2","media/aula/pop-section-160.mp4":"a732571b09ef4e96","media/aula/pop-section-160.visemes.json":"a693effdcccf5858","media/aula/pop-section-160.vtt":"d5808744e79087f8","media/aula/pop-section-161.jpg":"b4cc159174cf00de","media/aula/pop-section-161.mp4":"fe1166b0672c65d9","media/aula/pop-section-161.visemes.json":"f7c9e858685cb4af","media/aula/pop-section-161.vtt":"096876308dfe4047","media/aula/pop-section-168.jpg":"7f48fca17d5f24b1","media/aula/pop-section-168.mp4":"f6779588ce00afb9","media/aula/pop-section-168.visemes.json":"6f2593e6d0608849","media/aula/pop-section-168.vtt":"509dacc9159d15df","media/aula/pop-section-169.jpg":"a697b64868193bf4","media/aula/pop-section-169.mp4":"b00d73fd28dfb525","media/aula/pop-section-169.visemes.json":"03f41c4e5dc9213b","media/aula/pop-section-169.vtt":"18bb8b02b3efa57d","media/aula/pop-section-170.jpg":"09ff7bc445bf2892","media/aula/pop-section-170.mp4":"a140b737b7fd50f7","media/aula/pop-section-170.visemes.json":"a6df82019674ec43","media/aula/pop-section-170.vtt":"8b382e2124a07481","media/aula/pop-section-171.jpg":"2bc4ca488350572e","media/aula/pop-section-171.mp4":"4fcd4435b90cb383","media/aula/pop-section-171.visemes.json":"06d4ec1746a2491a","media/aula/pop-section-171.vtt":"20d2ec41ab328704","media/aula/pop-section-172.jpg":"c2fd2b956b421924","media/aula/pop-section-172.mp4":"1408d43f9aed785b","media/aula/pop-section-172.visemes.json":"fd4585e44d1b3870","media/aula/pop-section-172.vtt":"83b297be8cefb6f8","media/aula/pop-section-173.jpg":"d5fb761cd2986b6c","media/aula/pop-section-173.mp4":"5f0aa38a994df348","media/aula/pop-section-173.visemes.json":"d8b7379cacaa68db","media/aula/pop-section-173.vtt":"0bcfbf91a923b0c4","media/aula/pop-section-174.jpg":"46ce3b0e9cebadba","media/aula/pop-section-174.mp4":"446f483620db6cc2","media/aula/pop-section-174.visemes.json":"22ec337d78ae3fdc","media/aula/pop-section-174.vtt":"dc02c8c367bc59ea","media/aula/pop-section-175.jpg":"925bca9c8dda914f","media/aula/pop-section-175.mp4":"d12b26a3dd6c9188","media/aula/pop-section-175.visemes.json":"1db7311b51deb78e","media/aula/pop-section-175.vtt":"defd2991446294e3","media/aula/pop-section-176.jpg":"17a83da7e3bb83e7","media/aula/pop-section-176.mp4":"80596fa4892bc387","media/aula/pop-section-176.visemes.json":"67466964588a09ea","media/aula/pop-section-176.vtt":"85bcab8b75c81d3a","media/aula/pop-section-177.jpg":"af4544349f889255","media/aula/pop-section-177.mp4":"99667cf7c9537847","media/aula/pop-section-177.visemes.json":"b67d2dbb410d6d15","media/aula/pop-section-177.vtt":"e0c478b106999e24","media/aula/pop-section-178.jpg":"15b3a6783150c814","media/aula/pop-section-178.mp4":"7dfb2c9b1ba379c5","media/aula/pop-section-178.visemes.json":"e9ea60fe845b4893","media/aula/pop-section-178.vtt":"adb12a656b3f296a","media/aula/pop-section-179.jpg":"e817ae4bfbe045c6","media/aula/pop-section-179.mp4":"26527f108f596315","media/aula/pop-section-179.visemes.json":"eceabb2a512f2afc","media/aula/pop-section-179.vtt":"356710fad7753a5f","media/aula/pop-section-180.jpg":"030c7fa2413b3be9","media/aula/pop-section-180.mp4":"ca7aabfc077ca7c6","media/aula/pop-section-180.visemes.json":"756e3a17a5e672d4","media/aula/pop-section-180.vtt":"9ab5ba16dd54ac4b","media/aula/pop-section-181.jpg":"f87178163980757f","media/aula/pop-section-181.mp4":"5b5a24a7d10d390d","media/aula/pop-section-181.visemes.json":"0246632c1dd5354f","media/aula/pop-section-181.vtt":"47ec0baf4e3e6f24","media/aula/pop-section-182.jpg":"9d9b2bdc4f29b891","media/aula/pop-section-182.mp4":"83023558abecbe47","media/aula/pop-section-182.visemes.json":"414ecc748cff8ef1","media/aula/pop-section-182.vtt":"2771564e4aeca628","media/aula/pop-section-183.jpg":"457e3d186b89a5c9","media/aula/pop-section-183.mp4":"fa906c9d7769306f","media/aula/pop-section-183.visemes.json":"cae8642c5df8d47a","media/aula/pop-section-183.vtt":"2aab3cdb668ad823","media/aula/pop-section-184.jpg":"11e2821fd8e77c85","media/aula/pop-section-184.mp4":"8075bc48584f6ffb","media/aula/pop-section-184.visemes.json":"a6152a821608bc74","media/aula/pop-section-184.vtt":"ddf8c93f0fbad0e2","media/enquadramento-poster.png":"9e47d6cc2985d5be","media/enquadramento.mp4":"61643702aee784cc","media/enquadramento.svg":"05563f58b655079f","media/enquadramento.vtt":"3bf4c61e982d9763","media/fluxo-geral-poster.png":"9508c06744ed1d54","media/fluxo-geral.mp4":"018b5494d48472e8","media/fluxo-geral.svg":"4491da25e90fdc6b","media/fluxo-geral.vtt":"b25a319cc1cdb6c6","media/learning-stage/professor-sprite.webp":"b5aea6aaa0ba368b","media/learning-stage/professor-visemes-v2.png":"ef077fddc5e5141e","media/learning-stage/professor-visemes-v2.webp":"5a256fdd0449fb89","media/learning-stage/thematic-atlas.webp":"1800c76226a8f9c3","media/m00-poster.png":"bc0bacf49f4ecb1b","media/m00.mp4":"c06260af09b82284","media/m00.vtt":"ac1594ab7b281b43","media/m01-poster.png":"7a540bb834b9e682","media/m01.mp4":"260788902bd427b5","media/m01.vtt":"17b17b41859a0608","media/m02-poster.png":"1b44f6fd78c2f510","media/m02.mp4":"2828384dd1b101bb","media/m02.vtt":"f58e008f380f66e9","media/m03-poster.png":"179a14224fff7cbd","media/m03.mp4":"5fc636ab34cc4c73","media/m03.vtt":"50f33d41c369f09c","media/m04-poster.png":"397334608620df6d","media/m04.mp4":"67882e1772ec085e","media/m04.vtt":"bab29addcb138710","media/m05-poster.png":"9b483e05faf7aa9c","media/m05.mp4":"ca6ed0c257749f10","media/m05.vtt":"4f0e5ed829668e6f","media/m06-poster.png":"74ca37a4a6d5843d","media/m06.mp4":"a67926e08092aafa","media/m06.vtt":"3780a32d9c9cb0b4","media/m07-poster.png":"41c799d72b498530","media/m07.mp4":"55023395e3b2f7f8","media/m07.vtt":"61b797ad3a6d83b5","media/m08-poster.png":"720d3b3885b706a6","media/m08.mp4":"4965fbbe9d3eaef9","media/m08.vtt":"f089474e3f4429f1","media/m09-poster.png":"bc2fcd6dbb385e94","media/m09.mp4":"1b45ca5b834082ac","media/m09.vtt":"8c531184c56c39b1","media/m10-poster.png":"979b9063e9ba0bd9","media/m10.mp4":"ea81c391ca69cddc","media/m10.vtt":"897195b03c968839","media/m11-poster.png":"fdd935d7d28ec19e","media/m11.mp4":"07c64548e51a7674","media/m11.vtt":"51765a9b0ca70681","media/m12-poster.png":"13d969e7044d41e8","media/m12.mp4":"ecdb83d952aa5df6","media/m12.vtt":"6443e58816907666","media/m13-poster.png":"c8e2704350ba2738","media/m13.mp4":"b9dc1ead8ff2212e","media/m13.vtt":"7bd1fcfc433464e8","media/m14-poster.png":"39d82184a0606513","media/m14.mp4":"dacb9017dfc1eff3","media/m14.vtt":"f8bcf0012b7a6006","media/m15-poster.png":"4b45193c78632a5e","media/m15.mp4":"81122f1018cf5725","media/m15.vtt":"c06a16731eecd1e3","media/m16-poster.png":"d5582292642ac625","media/m16.mp4":"e95003477ec1fc98","media/m16.vtt":"10cb1140ed68e535","media/media-manifest.json":"5f88d5daabea0732","media/pacuera-poster.png":"4b9c3532d64516de","media/pacuera.mp4":"d5e57fae1613ca55","media/pacuera.svg":"2b34979afc2e0815","media/pacuera.vtt":"6be9ec65f3a5ba32","media/piloto/manifest.json":"ade0d68b80391328","media/piloto/pop-section-018.jpg":"ec4a00392da3804f","media/piloto/pop-section-018.mp4":"066755188f968c48","media/piloto/pop-section-018.txt":"d77b3ebff18176c6","media/piloto/pop-section-018.visemes.json":"fc43ff20817790dc","media/piloto/pop-section-018.vtt":"9e02cc9191369609","media/piloto/pop-section-059.jpg":"7f729bc0d999dc4d","media/piloto/pop-section-059.mp4":"078d25a75274879e","media/piloto/pop-section-059.txt":"445156b41020d1cf","media/piloto/pop-section-059.visemes.json":"c3f7e6304926c9bf","media/piloto/pop-section-059.vtt":"90e3063869f58606","media/piloto/pop-section-069.jpg":"a78872c0f82e1d2d","media/piloto/pop-section-069.mp4":"686b6b49eed8a5da","media/piloto/pop-section-069.txt":"ccffa283f6eec2ec","media/piloto/pop-section-069.visemes.json":"5ae6103be5b824a7","media/piloto/pop-section-069.vtt":"924376841ec20b72","media/piloto/pop-section-094.jpg":"fff4e38e0f38ef4b","media/piloto/pop-section-094.mp4":"8cc36d01024aa7bd","media/piloto/pop-section-094.txt":"6797b5d6eed5b930","media/piloto/pop-section-094.visemes.json":"b3b8b13331213b06","media/piloto/pop-section-094.vtt":"da12cc73419fe80a","media/piloto/pop-section-108.jpg":"6a04b5cac6a90595","media/piloto/pop-section-108.mp4":"df92341d327d11b6","media/piloto/pop-section-108.txt":"8400ecf89bf2ff98","media/piloto/pop-section-108.visemes.json":"a5aa0ae06b62ad41","media/piloto/pop-section-108.vtt":"667c6e98f2f86868","media/piloto/pop-section-134.jpg":"b131a0f8b333e993","media/piloto/pop-section-134.mp4":"a32f8a962848915f","media/piloto/pop-section-134.txt":"1d63246075d4de5d","media/piloto/pop-section-134.visemes.json":"95b8e89e84573788","media/piloto/pop-section-134.vtt":"eb119760e2a7d413","media/piloto/provenance.json":"cdb28cda31c122d4","source-assets/asset-manifest.json":"20c2584b66424158","source-assets/flow-image-001.png":"208ea985e008f39b","source-assets/flow-image-002.png":"79a8e9b8b2e6a3e5","source-assets/flow-image-003.png":"29df83d18cc8c631","source-assets/flow-image-004.png":"d59a6be90cfa01ad","source-assets/flow-image-005.png":"6e97cef276820e69","source-assets/flow-image-006.png":"3ab6202fd3f40f8b","source-assets/flow-image-007.png":"35fc85296a96b4cd","source-assets/flow-image-008.png":"096807789452730f","source-assets/flow-image-009.png":"884fa0b464778caa","source-assets/flow-image-010.png":"8e834813a8e93d44","source-assets/flow-image-011.png":"9c690b165e6a0693","source-assets/flow-image-012.png":"b5e740c262a8dc40","source-assets/flow-image-013.png":"00a3bd8c50c5a1e7","source-assets/flow-image-014.png":"b9cac83516e534a5","source-assets/flow-image-015.png":"8164c33111c5cb4e","source-assets/flow-image-016.png":"68ee6824db2c2cbe","source-assets/flow-image-017.png":"e54f06d839c38c77","source-assets/flow-image-018.png":"685732c43ddcf06b","source-assets/flow-image-019.png":"67b3319e2e3b62fd","source-assets/flow-image-020.png":"ff666afe5a736cdf","source-assets/flow-image-021.png":"3dac46e269b06d76","source-assets/pop-image-001.png":"3bbe09d62a6ae6a1","source-assets/pop-image-002.png":"7103a9b2056720df","source-assets/pop-image-003.png":"55f362ecb646863e","source-assets/pop-image-004.png":"6c619bcef80b5965","source-assets/pop-image-005.png":"20529379642a11b4","source-assets/pop-image-006.png":"7e3b148349d20945","source-assets/pop-image-007.png":"de37652eff2ddfa7","source-assets/pop-image-008.png":"1388350597b4aed9","source-assets/pop-image-009.png":"a0165423e8df6300","source-assets/pop-image-010.png":"260b9c48a9e451c1","source-assets/pop-image-011.png":"7ad03b92d4f84c4f","source-assets/pop-image-012.png":"3520326faeb99409","source-assets/pop-image-013.png":"5aec6712cbc9c622","source-assets/pop-image-014.png":"984d46b21df8c8d7"};
const INDEX_URL = new URL(BASE + 'index.html', self.location.origin).href;
const META_MIDIA_URL = new URL(BASE + '__pwa/revisoes-midia.json', self.location.origin).href;
// navigator.onLine pode voltar a true numa pagina que acabou de nascer de
// um fallback do Service Worker (isso ocorre inclusive no Chromium). O estado
// observado pela navegacao network-first e mais fiel e pode ser consultado
// pela interface logo depois do carregamento.
let ULTIMA_CONEXAO_DA_NAVEGACAO = null;
let ULTIMA_CONEXAO_DA_NAVEGACAO_EM = null;

function serializarErro(erro, codigoPadrao) {
  const nome = erro && erro.name ? String(erro.name) : '';
  const mensagem = erro && erro.message ? String(erro.message) : String(erro || 'Erro desconhecido');
  const quota = nome === 'QuotaExceededError' || /quota|storage|armazenamento/i.test(mensagem);
  return {
    codigo: quota ? 'QUOTA_EXCEEDED' : codigoPadrao,
    mensagem,
  };
}

async function publicar(tipo, dados = {}) {
  try {
    const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const cliente of janelas) {
      cliente.postMessage({ origem: APP_ID, tipo, versao: VERSAO, ...dados });
    }
  } catch {
    // Uma falha de telemetria local nunca deve impedir o funcionamento offline.
  }
}

function responderMensagem(evento, mensagem) {
  const destino = evento.ports && evento.ports[0] ? evento.ports[0] : evento.source;
  if (destino && typeof destino.postMessage === 'function') destino.postMessage(mensagem);
}

function estaNoEscopo(url) {
  return url.origin === self.location.origin &&
    (BASE === '/' || url.pathname.startsWith(BASE));
}

function ehEntradaDaAplicacao(url) {
  const entrada = new URL(INDEX_URL);
  const raiz = new URL(BASE, self.location.origin);
  return url.origin === entrada.origin &&
    (url.pathname === entrada.pathname || url.pathname === raiz.pathname);
}

function caminhoNoEscopo(url) {
  return BASE === '/' ? url.pathname.replace(/^\/+/, '') : url.pathname.slice(BASE.length);
}

function ehMidia(url) {
  return estaNoEscopo(url) && /^(media|hidro|source-assets)\//.test(caminhoNoEscopo(url));
}

function pedidoCompleto(request) {
  const headers = new Headers(request.headers);
  headers.delete('range');
  headers.delete('if-range');
  return new Request(request, { headers, cache: 'no-store' });
}

function pedidoCompletoDaUrl(url) {
  return new Request(url.href, {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
  });
}

function validarUrlDeMidia(valor) {
  const url = new URL(String(valor), self.location.origin);
  if (!ehMidia(url)) throw new Error('URL fora das pastas de mídia da Academia IAT.');
  return url;
}

async function guardarRespostaCompleta(cache, request, response) {
  if (!response.ok || response.status !== 200) {
    throw new Error('A origem não forneceu o arquivo completo (HTTP ' + response.status + ').');
  }
  try {
    await cache.put(request, response.clone());
  } catch (erro) {
    const detalhe = serializarErro(erro, 'MEDIA_CACHE_WRITE_FAILED');
    await publicar('IAT_PWA_ERROR', {
      etapa: 'cache-midia',
      url: request.url,
      ...detalhe,
    });
    throw Object.assign(new Error(detalhe.mensagem), { code: detalhe.codigo });
  }
  const verificacao = await cache.match(request, { ignoreVary: true });
  if (!verificacao || verificacao.status !== 200) {
    throw Object.assign(new Error('O arquivo não pôde ser confirmado no armazenamento offline.'), {
      code: 'MEDIA_CACHE_VERIFY_FAILED',
    });
  }
}

async function respostaParcial(request, respostaCompleta) {
  const cabecalho = request.headers.get('range');
  const corpo = await respostaCompleta.arrayBuffer();
  const tamanho = corpo.byteLength;
  const correspondencia = /^bytes=(\d*)-(\d*)$/i.exec((cabecalho || '').trim());
  if (!correspondencia || (!correspondencia[1] && !correspondencia[2])) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + tamanho, 'Accept-Ranges': 'bytes' },
    });
  }

  let inicio;
  let fim;
  if (!correspondencia[1]) {
    const sufixo = Number(correspondencia[2]);
    if (!Number.isFinite(sufixo) || sufixo <= 0) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': 'bytes */' + tamanho, 'Accept-Ranges': 'bytes' },
      });
    }
    inicio = Math.max(0, tamanho - sufixo);
    fim = tamanho - 1;
  } else {
    inicio = Number(correspondencia[1]);
    fim = correspondencia[2] ? Number(correspondencia[2]) : tamanho - 1;
  }

  if (!Number.isFinite(inicio) || !Number.isFinite(fim) ||
      inicio < 0 || inicio >= tamanho || fim < inicio) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + tamanho, 'Accept-Ranges': 'bytes' },
    });
  }
  fim = Math.min(fim, tamanho - 1);

  const headers = new Headers(respostaCompleta.headers);
  headers.delete('content-encoding');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Range', 'bytes ' + inicio + '-' + fim + '/' + tamanho);
  headers.set('Content-Length', String(fim - inicio + 1));
  return new Response(corpo.slice(inicio, fim + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers,
  });
}

async function reconciliarRevisoesDeMidia() {
  const cache = await caches.open(CACHE_MIDIA);
  let anteriores = {};
  try {
    const respostaAnterior = await cache.match(META_MIDIA_URL, { ignoreVary: true });
    if (respostaAnterior) anteriores = await respostaAnterior.json();
  } catch {
    anteriores = {};
  }

  const chaves = await cache.keys();
  for (const chave of chaves) {
    if (chave.url === META_MIDIA_URL) continue;
    const url = new URL(chave.url);
    const relativo = caminhoNoEscopo(url);
    const revisaoAtual = REVISOES_MIDIA[relativo];
    const revisaoAnterior = anteriores[relativo];
    // Mídia removida do build não deve sobreviver para sempre. Uma mídia sem
    // metadado anterior é preservada por segurança; pode ter sido baixada por
    // uma versão que antecede este mecanismo.
    if (!revisaoAtual || (revisaoAnterior && revisaoAnterior !== revisaoAtual)) {
      await cache.delete(chave, { ignoreVary: true });
    }
  }

  try {
    await cache.put(META_MIDIA_URL, new Response(JSON.stringify(REVISOES_MIDIA), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
  } catch (erro) {
    await publicar('IAT_PWA_ERROR', {
      etapa: 'revisoes-midia',
      ...serializarErro(erro, 'MEDIA_REVISION_WRITE_FAILED'),
    });
  }
}

async function mapearComConcorrencia(itens, limite, tarefa) {
  if (!itens.length) return [];
  const resultados = new Array(itens.length);
  let proximo = 0;
  const trabalhadores = Array.from(
    { length: Math.min(limite, itens.length) },
    async () => {
      while (proximo < itens.length) {
        const indice = proximo;
        proximo += 1;
        resultados[indice] = await tarefa(itens[indice], indice);
      }
    },
  );
  await Promise.all(trabalhadores);
  return resultados;
}

async function estadoDosCaches(urlConsultada, urlsConsultadas) {
  const nomes = await caches.keys();
  const cacheNucleo = await caches.open(CACHE_NUCLEO);
  const cacheMidia = await caches.open(CACHE_MIDIA);
  const chaves = (await cacheMidia.keys()).filter((chave) => chave.url !== META_MIDIA_URL);
  const urlsEmCache = new Set(chaves.map((chave) => chave.url));
  let bytesConhecidos = 0;
  let itensSemTamanho = 0;

  const tamanhos = await mapearComConcorrencia(chaves, 12, async (chave) => {
    const resposta = await cacheMidia.match(chave, { ignoreVary: true });
    const tamanho = Number(resposta && resposta.headers.get('content-length'));
    return Number.isFinite(tamanho) && tamanho >= 0 ? tamanho : null;
  });
  for (const tamanho of tamanhos) {
    if (tamanho === null) itensSemTamanho += 1;
    else bytesConhecidos += tamanho;
  }

  let urlGuardada;
  if (urlConsultada) {
    const url = validarUrlDeMidia(urlConsultada);
    urlGuardada = urlsEmCache.has(pedidoCompletoDaUrl(url).url);
  }
  const urlsGuardadas = {};
  const consultas = [...new Set(
    (Array.isArray(urlsConsultadas) ? urlsConsultadas : []).map(String),
  )].slice(0, 700);
  for (const item of consultas) {
    const url = validarUrlDeMidia(item);
    urlsGuardadas[item] = urlsEmCache.has(pedidoCompletoDaUrl(url).url);
  }

  return {
    versao: VERSAO,
    base: BASE,
    conexaoDaUltimaNavegacao: ULTIMA_CONEXAO_DA_NAVEGACAO,
    conexaoDaUltimaNavegacaoEm: ULTIMA_CONEXAO_DA_NAVEGACAO_EM,
    nucleoPronto: Boolean(await cacheNucleo.match(INDEX_URL, { ignoreVary: true })),
    cacheDaAplicacao: nomes.filter((nome) => nome.startsWith(CACHE_PREFIX)),
    midia: {
      itens: chaves.length,
      bytesConhecidos,
      itensSemTamanho,
      urlGuardada,
      urlsGuardadas,
    },
  };
}

async function baixarMidias(evento, urls, forcarRede) {
  const lista = [...new Set((Array.isArray(urls) ? urls : []).map(String))].slice(0, 700);
  const cache = await caches.open(CACHE_MIDIA);
  const resultados = [];

  for (let indice = 0; indice < lista.length; indice += 1) {
    const valor = lista[indice];
    try {
      const url = validarUrlDeMidia(valor);
      const request = pedidoCompletoDaUrl(url);
      const existente = await cache.match(request, { ignoreVary: true });
      let origem = 'cache';
      if (!existente || forcarRede) {
        const resposta = await fetch(request);
        await guardarRespostaCompleta(cache, request, resposta);
        origem = 'rede';
      }
      const confirmado = await cache.match(request, { ignoreVary: true });
      if (!confirmado) throw Object.assign(new Error('Verificação do download falhou.'), {
        code: 'MEDIA_CACHE_VERIFY_FAILED',
      });
      resultados.push({ url: url.href, ok: true, origem });
    } catch (erro) {
      const detalhe = serializarErro(erro, erro && erro.code ? erro.code : 'MEDIA_DOWNLOAD_FAILED');
      resultados.push({ url: valor, ok: false, ...detalhe });
    }
    responderMensagem(evento, {
      tipo: 'IAT_MEDIA_PROGRESS',
      atual: indice + 1,
      total: lista.length,
      resultado: resultados[resultados.length - 1],
    });
  }

  const falhas = resultados.filter((item) => !item.ok);
  responderMensagem(evento, {
    tipo: 'IAT_RESPONSE',
    ok: true,
    resultado: {
      ok: falhas.length === 0,
      solicitados: lista.length,
      baixados: resultados.length - falhas.length,
      falhas,
      resultados,
      verificacao: await estadoDosCaches(),
    },
  });
}

async function removerMidias(urls, removerTodas = false) {
  if (removerTodas) {
    await caches.delete(CACHE_MIDIA);
    await caches.open(CACHE_MIDIA);
    return { removidos: 'todos' };
  }
  if (!Array.isArray(urls) || urls.length === 0) {
    throw Object.assign(new Error('Informe as mídias a remover ou confirme a limpeza total.'), {
      code: 'MEDIA_REMOVE_LIST_EMPTY',
    });
  }
  const cache = await caches.open(CACHE_MIDIA);
  let removidos = 0;
  for (const valor of [...new Set(urls.map(String))]) {
    const url = validarUrlDeMidia(valor);
    if (await cache.delete(pedidoCompletoDaUrl(url), { ignoreVary: true })) removidos += 1;
  }
  return { removidos };
}

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(CACHE_NUCLEO);
    const falhas = [];
    for (const caminho of PRECACHE) {
      const url = new URL(caminho, self.location.origin).href;
      try {
        const resposta = await fetch(new Request(url, { cache: 'reload' }));
        if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
        await cache.put(url, resposta);
      } catch (erro) {
        falhas.push({ url, ...serializarErro(erro, 'PRECACHE_ITEM_FAILED') });
      }
    }
    if (falhas.length) {
      await caches.delete(CACHE_NUCLEO);
      await publicar('IAT_PWA_ERROR', {
        etapa: 'precache',
        codigo: 'PRECACHE_FAILED',
        mensagem: falhas.length + ' arquivo(s) essencial(is) não puderam ser armazenados.',
        falhas,
      });
      throw new Error('Precache incompleto: ' + falhas.map((item) => item.url).join(', '));
    }
    // Não chama skipWaiting: uma versão nova permanece esperando a confirmação.
  })());
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes
      .filter((nome) => nome.startsWith(CACHE_NUCLEO_PREFIX) && nome !== CACHE_NUCLEO)
      .map((nome) => caches.delete(nome)));
    // CACHE_MIDIA é deliberadamente estável e caches de outros apps não são tocados.
    await reconciliarRevisoesDeMidia();
    await self.clients.claim();
    await publicar('IAT_PWA_ACTIVATED', { cacheNucleo: CACHE_NUCLEO });
  })());
});

self.addEventListener('fetch', (evento) => {
  const request = evento.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!estaNoEscopo(url)) return;

  if (request.mode === 'navigate') {
    evento.respondWith((async () => {
      try {
        const resposta = await fetch(request);
        ULTIMA_CONEXAO_DA_NAVEGACAO = 'online';
        ULTIMA_CONEXAO_DA_NAVEGACAO_EM = Date.now();
        const tipo = resposta.headers.get('content-type') || '';
        if (resposta.ok && ehEntradaDaAplicacao(url) && tipo.includes('text/html')) {
          try {
            const cache = await caches.open(CACHE_NUCLEO);
            await cache.put(INDEX_URL, resposta.clone());
          } catch (erro) {
            const detalhe = serializarErro(erro, 'CORE_SHELL_WRITE_FAILED');
            await publicar('IAT_PWA_ERROR', {
              etapa: 'cache-shell',
              ...detalhe,
              mensagem: 'A página abriu pela rede, mas a atualização do shell offline falhou.',
              url: request.url,
            });
          }
        }
        return resposta;
      } catch {
        ULTIMA_CONEXAO_DA_NAVEGACAO = 'offline';
        ULTIMA_CONEXAO_DA_NAVEGACAO_EM = Date.now();
        const cache = await caches.open(CACHE_NUCLEO);
        return (await cache.match(INDEX_URL, { ignoreVary: true })) ||
          new Response('<!doctype html><html lang="pt-BR"><title>Academia IAT indisponível</title><p>O núcleo offline ainda não foi concluído. Reconecte-se e tente novamente.</p>', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
      }
    })());
    return;
  }

  if (ehMidia(url)) {
    const processo = (async () => {
      const cache = await caches.open(CACHE_MIDIA);
      const completo = pedidoCompleto(request);
      const guardado = await cache.match(completo, { ignoreVary: true });

      if (guardado) {
        return {
          resposta: request.headers.has('range')
            ? await respostaParcial(request, guardado)
            : guardado,
        };
      }

      const cacheNucleo = await caches.open(CACHE_NUCLEO);
      const guardadoNoNucleo = await cacheNucleo.match(request, { ignoreVary: true });
      if (guardadoNoNucleo) {
        return {
          resposta: request.headers.has('range')
            ? await respostaParcial(request, guardadoNoNucleo)
            : guardadoNoNucleo,
        };
      }

      try {
        // Reprodução normal preserva Range e não transforma uma visualização
        // on-line em download persistente. O cache de mídia só é preenchido
        // pelo comando explícito IAT_CACHE_MEDIA.
        return { resposta: await fetch(request) };
      } catch (erroRede) {
        const detalhe = serializarErro(erroRede, 'MEDIA_OFFLINE_MISS');
        await publicar('IAT_PWA_ERROR', {
          etapa: 'buscar-midia',
          url: request.url,
          ...detalhe,
        });
        return {
          resposta: new Response('', {
            status: 504,
            statusText: 'Mídia não disponível offline',
            headers: { 'X-Academia-IAT-Offline': 'media-miss' },
          }),
        };
      }
    })();
    evento.respondWith(processo.then(({ resposta }) => resposta));
    evento.waitUntil(processo.then(() => undefined));
    return;
  }

  evento.respondWith((async () => {
    const cache = await caches.open(CACHE_NUCLEO);
    const guardado = await cache.match(request, { ignoreVary: true });
    if (guardado) return guardado;
    try {
      const resposta = await fetch(request);
      if (resposta.ok && caminhoNoEscopo(url).startsWith('assets/')) {
        try {
          await cache.put(request, resposta.clone());
        } catch (erro) {
          await publicar('IAT_PWA_ERROR', {
            etapa: 'cache-nucleo-runtime',
            url: request.url,
            ...serializarErro(erro, 'CORE_CACHE_WRITE_FAILED'),
          });
        }
      }
      return resposta;
    } catch {
      return new Response('', { status: 504, statusText: 'Recurso indisponível offline' });
    }
  })());
});

self.addEventListener('message', (evento) => {
  const dados = evento.data || {};
  if (dados.tipo === 'IAT_ACTIVATE_UPDATE') {
    evento.waitUntil(Promise.resolve(self.skipWaiting())
      .then(() => responderMensagem(evento, {
        tipo: 'IAT_UPDATE_ACCEPTED', ok: true, versao: VERSAO,
      }))
      .catch((erro) => responderMensagem(evento, {
        tipo: 'IAT_UPDATE_ACCEPTED',
        ok: false,
        erro: serializarErro(erro, 'UPDATE_ACTIVATION_FAILED'),
      })));
    return;
  }
  if (dados.tipo === 'IAT_GET_STATUS') {
    evento.waitUntil(estadoDosCaches(dados.url, dados.urls)
      .then((resultado) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: true, resultado,
      }))
      .catch((erro) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: false,
        erro: serializarErro(erro, 'STATUS_FAILED'),
      })));
    return;
  }
  if (dados.tipo === 'IAT_CACHE_MEDIA') {
    evento.waitUntil(baixarMidias(evento, dados.urls, Boolean(dados.forcarRede)));
    return;
  }
  if (dados.tipo === 'IAT_REMOVE_MEDIA') {
    evento.waitUntil(removerMidias(dados.urls, dados.removerTodas === true)
      .then((resultado) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: true, resultado,
      }))
      .catch((erro) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: false,
        erro: serializarErro(erro, 'MEDIA_REMOVE_FAILED'),
      })));
  }
});
