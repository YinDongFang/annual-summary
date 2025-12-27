import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ReportView } from "@/components/report/report-view";

interface PageProps {
  params: Promise<{ shareCode: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { shareCode } = await params;

  // 从数据库获取报告数据
  const { data: report, error: reportError } = await supabaseAdmin
    .from("reports")
    .select("id, movies")
    .eq("share_code", shareCode)
    .single();

  if (reportError || !report) {
    console.error(reportError);
    notFound();
  }

  console.log(report);

  // 获取所有相关数据
  const [moviesResult, concertsResult, travelsResult] = await Promise.all([
    supabaseAdmin.from("movies").select("*").in("id", report.movies),
    supabaseAdmin
      .from("concerts")
      .select("*")
      .in("id", [])
      .order("date", { ascending: false }),
    supabaseAdmin
      .from("travels")
      .select("*")
      .in("id", [])
      .order("date", { ascending: false }),
  ]);

  const movies = moviesResult.data || [];
  const concerts = concertsResult.data || [];
  const travels = travelsResult.data || [];

  return (
    <ReportView
      movies={movies}
      concerts={concerts}
      travels={travels}
      shareCode={shareCode}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { shareCode } = await params;
  return {
    title: `年度报告 - ${shareCode}`,
    description: "查看我们的年度报告",
  };
}
