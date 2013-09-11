# Represents a week in a certain year
class Week
  include Comparable
  attr :year, :week

  def initialize(year, week)
    @year = year
    @week = week
  end

  # Amount of weeks in this year
  def weeks_in_year
    Week.weeks_in_year(@year)
  end

  def succ
    week = @week + 1
    year = @year
    if week > weeks_in_year
      week = 1
      year += 1
    end
    Week.new(year, week)
  end

  def <=>(other)
    if @year == other.year
      @week <=> other.week
    else
      @year <=> other.year
    end
  end

  def to_i
    (0..@year).map(&:weeks_in_year).sum + @week
  end

  def to_s
    @year.to_s + @week.to_s
  end

  def to_date
    Date.commercial(@year, @week)
  end
  alias_method :to_begin_date, :to_date

  def to_end_date
    to_date + 6.days # 6 days to get to the last day in this week
  end

  def to_days
    to_begin_date..to_end_date
  end

  def self.weeks_in_year(year)
    Date.new(year, 12, 28).cweek
  end

  def self.from_date(date)
    # %V - Week number of the week-based year (01..53), %G - The week-based year
    Week.new(date.strftime('%G').to_i, date.strftime('%V').to_i)
  end
end