import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three-stdlib';
import { MTLLoader } from 'three-stdlib';
import { OrbitControls } from 'three-stdlib';

/**
 * 松本家の3Dモデルを表示するThree.jsシーンコンポーネント
 * OBJ/MTL形式の3Dモデルをロードして表示し、マウス操作による視点移動を提供
 */
const ThreeScene = () => {
  // Three.jsのcanvasをマウントするためのref
  const mountRef = useRef<HTMLDivElement>(null);
  // ローディング状態の管理
  const [loading, setLoading] = useState(true);
  // エラー状態の管理
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 既存のcanvasがあれば削除
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // シーンの初期化
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0); // 明るいグレーの背景

    // カメラの設定（透視投影カメラ）
    const camera = new THREE.PerspectiveCamera(
      45, // 視野角
      window.innerWidth / window.innerHeight, // アスペクト比
      0.1, // near（近いクリッピング面）
      1000 // far（遠いクリッピング面）
    );
    camera.position.set(10, 10, 10); // カメラ位置を設定
    camera.lookAt(0, 0, 0); // 原点を見る

    // レンダラーの設定
    const renderer = new THREE.WebGLRenderer({ antialias: true }); // アンチエイリアス有効
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // 影の有効化
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // ソフトな影
    mountRef.current.appendChild(renderer.domElement);

    // オービットコントロールの設定（マウスで視点操作）
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 慣性を有効化
    controls.dampingFactor = 0.05; // 慣性の強さ

    // 環境光の追加（全体を均一に照らす）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 指向性ライトの追加（太陽光のような光源）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true; // 影を落とす
    // 影のカメラ設定
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // MTLローダーとOBJローダーの初期化
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    // MTLファイル（マテリアル）のロード
    mtlLoader.load(
      '/src/assets/matsumoto-house1.mtl',
      (materials) => {
        // マテリアルをプリロード
        materials.preload();
        // OBJローダーにマテリアルを設定
        objLoader.setMaterials(materials);
        
        // OBJファイル（3Dモデル）のロード
        objLoader.load(
          '/src/assets/matsumoto-house1.obj',
          (object) => {
            // モデルのスケール調整（1/100に縮小）
            object.scale.set(0.001, 0.001, 0.001);
            
            // モデルを中心に配置
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);
            
            // 全てのメッシュに影の設定を適用
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true; // 影を落とす
                child.receiveShadow = true; // 影を受ける
              }
            });
            
            // シーンにモデルを追加
            scene.add(object);
            setLoading(false);
          },
          // OBJロード進行状況
          (progress) => {
            console.log('Loading OBJ:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
          },
          // OBJロードエラー
          (error) => {
            console.error('Error loading OBJ:', error);
            setError('Failed to load OBJ file');
            setLoading(false);
          }
        );
      },
      // MTLロード進行状況
      (progress) => {
        console.log('Loading MTL:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
      },
      // MTLロードエラー
      (error) => {
        console.error('Error loading MTL:', error);
        setError('Failed to load MTL file');
        setLoading(false);
      }
    );

    // アニメーションループ
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // コントロールの更新
      renderer.render(scene, camera); // レンダリング
    };

    // ウィンドウリサイズ時の処理
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // イベントリスナーの登録
    window.addEventListener('resize', handleResize);
    // アニメーション開始
    animate();

    // クリーンアップ処理
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* ローディング表示 */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'black',
          fontSize: '24px',
          zIndex: 100
        }}>
          Loading 3D Model...
        </div>
      )}
      {/* エラー表示 */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'red',
          fontSize: '24px',
          zIndex: 100
        }}>
          Error: {error}
        </div>
      )}
      {/* Three.jsのcanvasマウントポイント */}
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />
    </>
  );
};

export default ThreeScene;
